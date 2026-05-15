import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBearerPermission } from "@/lib/api-token-auth";
import { makeSlug } from "@/lib/slug";
import { createPostRevision, ensurePostStats, estimateReadingTime, estimateWordCount, recordPostWorkflow, syncPostSeo } from "@/lib/editorial-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const statuses = new Set(["SUBMITTED", "UNDER_REVIEW", "NEEDS_INFO", "APPROVED", "PUBLISHED", "CONVERTED_TO_POST", "REJECTED", "ARCHIVED"]);

async function uniqueSlug(input: string) {
  const base = makeSlug(input);
  let slug = base;
  let counter = 2;
  while (await prisma.post.findUnique({ where: { slug }, select: { id: true } })) slug = `${base}-${counter++}`;
  return slug;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await requireBearerPermission(request, "submissions:manage");
  if (response) return response;
  const body = await request.json().catch(() => ({}));

  if (body?.action === "convert-to-post") {
    const submission = await prisma.submission.findUnique({ where: { id: params.id }, include: { region: true } });
    if (!submission) return NextResponse.json({ ok: false, message: "الوارد غير موجود" }, { status: 404 });
    const title = submission.title || submission.summary || `مساهمة من ${submission.fullName || "قارئ"}`;
    const slug = await uniqueSlug(title);
    const contributor = submission.fullName
      ? await prisma.contributor.upsert({
          where: { slug: makeSlug(submission.fullName) },
          update: { name: submission.fullName, email: submission.email || undefined, phone: submission.phone || undefined, isActive: true },
          create: { name: submission.fullName, slug: makeSlug(submission.fullName), email: submission.email || null, phone: submission.phone || null, isActive: true },
        })
      : null;

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: submission.summary || submission.body.slice(0, 180),
        content: submission.body,
        status: "REVIEW" as never,
        type: submission.type === "ARTICLE" ? "CONTRIBUTOR_ARTICLE" as never : submission.type === "STORY" ? "STORY" as never : "REPORT" as never,
        contributorId: contributor?.id || null,
        regionId: submission.regionId,
        city: submission.region?.city || submission.region?.name || null,
        country: submission.region?.country || "اليمن",
        readingTime: estimateReadingTime(submission.body),
        wordCount: estimateWordCount(submission.body),
        seoTitle: title,
        seoDescription: submission.summary || submission.body.slice(0, 160),
      },
    });
    await syncPostSeo(prisma, post.id, { seoTitle: title, seoDescription: post.seoDescription, canonicalUrl: `${(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/articles/${slug}` });
    await ensurePostStats(prisma, post.id, 0);
    await createPostRevision(prisma, { postId: post.id, title: post.title, excerpt: post.excerpt, content: post.content, editorId: user?.id, changeNote: "تحويل وارد من تطبيق API", snapshot: post });
    await recordPostWorkflow(prisma, { postId: post.id, actorId: user?.id, action: "CREATED", toStatus: "REVIEW", note: `تم التحويل من الوارد ${submission.id}` });
    await prisma.submission.update({ where: { id: params.id }, data: { status: "CONVERTED_TO_POST" as never, convertedPostId: post.id, reviewNotes: body.reviewNotes || `حوّل إلى مقال: ${post.slug}` } });
    await prisma.activityLog.create({ data: { action: "submission.converted_to_post", entity: "Submission", entityId: params.id, userId: user?.id, metadata: { postId: post.id } } }).catch(() => null);
    return NextResponse.json({ ok: true, post, url: `/admin/articles?converted=${post.id}` });
  }

  const status = String(body?.status || "");
  const item = await prisma.submission.update({
    where: { id: params.id },
    data: {
      ...(statuses.has(status) ? { status: status as never } : {}),
      ...(typeof body?.reviewNotes === "string" ? { reviewNotes: body.reviewNotes || null } : {}),
    },
  });
  await prisma.activityLog.create({ data: { action: "submission.updated", entity: "Submission", entityId: params.id, userId: user?.id, metadata: { status: item.status } } }).catch(() => null);
  return NextResponse.json({ ok: true, item });
}
