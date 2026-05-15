import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBearerPermission } from "@/lib/api-token-auth";
import { postSchema } from "@/lib/validators";
import { makeSlug } from "@/lib/slug";
import { createPostRevision, ensurePostStats, estimateReadingTime, estimateWordCount, recordPostWorkflow, syncPostSeo } from "@/lib/editorial-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function uniqueSlug(input: string, currentId: string) {
  const base = makeSlug(input);
  let slug = base;
  let counter = 2;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${counter++}`;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireBearerPermission(request, "posts:update");
  if (response) return response;
  const item = await prisma.post.findUnique({ where: { id: params.id }, include: { category: true, contributor: true, author: { select: { id: true, name: true, email: true } } } });
  if (!item) return NextResponse.json({ ok: false, message: "المقال غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await requireBearerPermission(request, "posts:update");
  if (response) return response;
  try {
    const body = await request.json().catch(() => null);
    const current = await prisma.post.findUnique({ where: { id: params.id }, select: { id: true, title: true, content: true, status: true, publishedAt: true } });
    if (!current) return NextResponse.json({ ok: false, message: "المقال غير موجود" }, { status: 404 });

    const merged = { ...body, title: body?.title || current.title, content: body?.content || current.content };
    const parsed = postSchema.safeParse(merged);
    if (!parsed.success) return NextResponse.json({ ok: false, message: "بيانات المقال غير مكتملة", errors: parsed.error.flatten() }, { status: 400 });

    const data = parsed.data;
    const slug = await uniqueSlug(data.slug || data.title, params.id);
    const now = new Date();
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const writeData = {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content,
      coverImage: data.coverImage || null,
      thumbnail: data.thumbnail || data.coverImage || null,
      type: data.type as never,
      status: data.status as never,
      categoryId: data.categoryId || null,
      contributorId: data.contributorId || null,
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || data.excerpt || null,
      canonicalUrl: `${(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/articles/${slug}`,
      readingTime: estimateReadingTime(data.content),
      wordCount: estimateWordCount(data.content),
      city: data.city || null,
      country: data.country || "اليمن",
      scheduledAt,
      approvedAt: data.status === "APPROVED" || data.status === "PUBLISHED" ? now : null,
      publishedAt: data.status === "PUBLISHED" ? (current.publishedAt || now) : null,
    };
    const item = await prisma.post.update({ where: { id: params.id }, data: writeData });
    await syncPostSeo(prisma, item.id, writeData);
    await ensurePostStats(prisma, item.id, item.viewsCount || 0);
    await createPostRevision(prisma, { postId: item.id, title: item.title, excerpt: item.excerpt, content: item.content, editorId: user?.id, changeNote: "تحديث عبر تطبيق API", snapshot: writeData });
    await recordPostWorkflow(prisma, { postId: item.id, actorId: user?.id, action: "UPDATED", fromStatus: current.status, toStatus: data.status });
    return NextResponse.json({ ok: true, item, url: `/articles/${item.slug}` });
  } catch (error) {
    console.error("[api:v1:admin:posts:id]", error);
    return NextResponse.json({ ok: false, message: "تعذر تحديث المقال" }, { status: 500 });
  }
}
