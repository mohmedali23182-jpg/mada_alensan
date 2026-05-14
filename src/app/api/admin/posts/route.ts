import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { postSchema } from "@/lib/validators";
import { makeSlug } from "@/lib/slug";
import { createPostRevision, ensurePostStats, estimateReadingTime, estimateWordCount, recordPostWorkflow, syncPostSeo } from "@/lib/editorial-db";

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

export async function GET() {
  const { response } = await requirePermission("posts:update");
  if (response) return response;
  const items = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, contributor: true, author: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const { user, response } = await requirePermission("posts:create");
  if (response) return response;
  if (!user) return NextResponse.json({ ok: false, message: "غير مصرح" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const id = typeof body?.id === "string" ? body.id : undefined;
  const slug = await uniqueSlug(data.slug || data.title, id);
  const status = data.status as never;
  const now = new Date();
  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;

  const previous = id ? await prisma.post.findUnique({ where: { id }, select: { status: true, publishedAt: true } }) : null;

  const writeData = {
    title: data.title,
    slug,
    excerpt: data.excerpt || null,
    content: data.content,
    coverImage: data.coverImage || null,
    thumbnail: data.thumbnail || data.coverImage || null,
    type: data.type as never,
    status,
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
    publishedAt: data.status === "PUBLISHED" ? (previous?.publishedAt || now) : null,
  };

  const item = id
    ? await prisma.post.update({ where: { id }, data: writeData })
    : await prisma.post.create({ data: { ...writeData, authorId: user.id } });

  await syncPostSeo(prisma, item.id, writeData);
  await ensurePostStats(prisma, item.id, item.viewsCount || 0);
  await createPostRevision(prisma, {
    postId: item.id,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    editorId: user.id,
    changeNote: id ? "تحديث عبر API" : "إنشاء عبر API",
    snapshot: writeData,
  });
  await recordPostWorkflow(prisma, {
    postId: item.id,
    actorId: user.id,
    action: id ? "UPDATED" : "CREATED",
    fromStatus: previous?.status || null,
    toStatus: String(status),
  });

  return NextResponse.json({ ok: true, item, url: `/articles/${item.slug}` });
}
