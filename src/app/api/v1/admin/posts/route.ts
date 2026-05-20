import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/api-token-auth";
import { postSchema } from "@/lib/validators";
import { makeSlug } from "@/lib/slug";
import { readingTimeFromContent, sanitizeRichHtml, stripHtml } from "@/lib/rich-content";
import { afterPostMutation, afterPostPublishedToTelegram } from "@/lib/post-publish";
import { readJsonSafe, jsonOk, jsonError } from "@/lib/http-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function uniqueSlug(input: string, currentId?: string) {
  const base = makeSlug(input);
  let slug = base;
  let counter = 2;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${counter++}`;
  }
}

function listFromComma(value?: string | string[]) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value || "").split(",").map((v) => v.trim()).filter(Boolean);
}

async function syncTags(postId: string, tagNames: string[]) {
  await prisma.postTag.deleteMany({ where: { postId } });
  for (const name of [...new Set(tagNames)].slice(0, 30)) {
    const tag = await prisma.tag.upsert({
      where: { slug: makeSlug(name) },
      update: { name },
      create: { name, slug: makeSlug(name) },
    });
    await prisma.postTag.create({ data: { postId, tagId: tag.id } });
  }
}

export async function GET(request: Request) {
  const { errorResponse } = await requireAdminPermission("posts:update");
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || undefined;
  const take = Math.min(Number(searchParams.get("take") || 50), 100);

  try {
    if (id) {
      const item = await prisma.post.findUnique({
        where: { id },
        include: {
          category: true,
          contributor: true,
          author: { select: { id: true, name: true, email: true } },
          tags: { include: { tag: true } },
        },
      });
      if (!item) return jsonError("المقال غير موجود", 404);
      return jsonOk({ item });
    }

    const items = await prisma.post.findMany({
      orderBy: [{ createdAt: "desc" }],
      take,
      include: {
        category: true,
        contributor: true,
        author: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } },
      },
    });
    return jsonOk({ items });
  } catch (error) {
    console.error("GET /api/v1/admin/posts error:", error);
    return jsonError("حدث خطأ أثناء جلب المقالات", 500);
  }
}

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAdminPermission("posts:create");
  if (errorResponse) return errorResponse;
  if (!user) return jsonError("غير مصرح", 401);

  const body = await readJsonSafe(request);
  if (!body) return jsonError("طلب غير صالح أو فارغ", 400);

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errors = Object.fromEntries(
      Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] || "قيمة غير صحيحة"])
    );
    return jsonError("يرجى مراجعة الحقول المطلوبة.", 400, errors);
  }

  const data = parsed.data;
  const id = typeof body?.id === "string" && body.id ? body.id : undefined;

  if (id) {
    const updateCheck = await requireAdminPermission("posts:update");
    if (updateCheck.errorResponse) return updateCheck.errorResponse;
  }

  try {
    const slug = await uniqueSlug(data.slug || data.title, id);
    const now = new Date();
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const cleanContent = sanitizeRichHtml(data.content);
    const plain = stripHtml(cleanContent);
    const status = data.status as any;
    const tags = listFromComma(body?.tags);
    const seoKeywords = listFromComma(body?.seoKeywords).length ? listFromComma(body?.seoKeywords) : tags;
    const publishedAt = data.status === "PUBLISHED" ? (id && body?.keepPublishedAt ? undefined : now) : null;

    const writeData = {
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt?.trim() || plain.slice(0, 220) || null,
      content: cleanContent,
      coverImage: data.coverImage || null,
      thumbnail: data.thumbnail || data.coverImage || null,
      quote: typeof body?.quote === "string" ? body.quote.trim() || null : null,
      type: data.type as any,
      status,
      categoryId: data.categoryId || null,
      contributorId: data.contributorId || null,
      readingTime: readingTimeFromContent(cleanContent),
      featured: Boolean(body?.featured),
      isStoryOfDay: Boolean(body?.isStoryOfDay),
      seoTitle: data.seoTitle?.trim() || data.title.trim(),
      seoDescription: data.seoDescription?.trim() || data.excerpt?.trim() || plain.slice(0, 160) || null,
      seoKeywords,
      ogTitle: typeof body?.ogTitle === "string" && body.ogTitle.trim() ? body.ogTitle.trim() : data.seoTitle?.trim() || data.title.trim(),
      ogDescription: typeof body?.ogDescription === "string" && body.ogDescription.trim() ? body.ogDescription.trim() : data.seoDescription?.trim() || data.excerpt?.trim() || null,
      ogImage: data.coverImage || data.thumbnail || null,
      twitterTitle: typeof body?.twitterTitle === "string" && body.twitterTitle.trim() ? body.twitterTitle.trim() : data.seoTitle?.trim() || data.title.trim(),
      twitterDescription: typeof body?.twitterDescription === "string" && body.twitterDescription.trim() ? body.twitterDescription.trim() : data.seoDescription?.trim() || data.excerpt?.trim() || null,
      twitterImage: data.coverImage || data.thumbnail || null,
      canonicalUrl: `${(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/articles/${slug}`,
      city: data.city || null,
      country: data.country || "اليمن",
      scheduledAt,
      ...(publishedAt === undefined ? {} : { publishedAt }),
    };

    const item = id
      ? await prisma.post.update({ where: { id }, data: writeData })
      : await prisma.post.create({ data: { ...writeData, authorId: user.id } });

    await syncTags(item.id, tags);
    await afterPostMutation({ slug: item.slug, status: item.status });
    if (item.status === "PUBLISHED") await afterPostPublishedToTelegram(item.id).catch(() => null);

    return jsonOk({ item, url: `/articles/${item.slug}` });
  } catch (error) {
    console.error("POST /api/v1/admin/posts error:", error);
    return jsonError("حدث خطأ أثناء حفظ المقال", 500);
  }
}
