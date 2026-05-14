import { revalidatePath } from "next/cache";
import Link from "next/link";
import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";
import { formatMakkahDateTime } from "@/lib/date";
import { makeSlug } from "@/lib/slug";
import { createPostRevision, ensurePostStats, estimateReadingTime, estimateWordCount, recordPostWorkflow, syncPostSeo } from "@/lib/editorial-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const submissionStatuses = ["SUBMITTED", "UNDER_REVIEW", "NEEDS_INFO", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"] as const;

function normalizeSubmissionStatus(value: FormDataEntryValue | null) {
  const status = String(value || "SUBMITTED");
  return (submissionStatuses as readonly string[]).includes(status) ? status : "SUBMITTED";
}

async function updateSubmissionStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  if (!id) return;
  await prisma.submission.update({
    where: { id },
    data: {
      status: normalizeSubmissionStatus(formData.get("status")) as never,
      reviewNotes: String(formData.get("reviewNotes") || "").trim() || null,
    },
  });
  revalidatePath("/admin/submissions");
}

async function convertSubmissionToPost(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  if (!id) return;
  const submission = await prisma.submission.findUnique({ where: { id }, include: { region: true } });
  if (!submission) return;
  const title = submission.title || submission.summary || `مساهمة من ${submission.fullName || "قارئ"}`;
  const slugBase = makeSlug(title);
  let slug = slugBase;
  let counter = 2;
  while (await prisma.post.findUnique({ where: { slug }, select: { id: true } })) slug = `${slugBase}-${counter++}`;
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
  await createPostRevision(prisma, { postId: post.id, title: post.title, excerpt: post.excerpt, content: post.content, changeNote: "تحويل وارد إلى مسودة مراجعة", snapshot: post });
  await recordPostWorkflow(prisma, { postId: post.id, action: "CREATED", toStatus: "REVIEW", note: `تم التحويل من الوارد ${submission.id}` });
  await prisma.submission.update({ where: { id }, data: { status: "PUBLISHED" as never, reviewNotes: `حوّل إلى مقال: ${post.slug}` } });
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/articles");
}

async function updateContactStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  if (!id) return;
  await prisma.contactMessage.update({ where: { id }, data: { status: String(formData.get("status") || "new") } });
  revalidatePath("/admin/submissions");
}

export default async function AdminSubmissionsPage() {
  const submissions = await safeAdminQuery(
    "submissions-list",
    () => prisma.submission.findMany({ orderBy: { createdAt: "desc" }, take: 60, include: { region: { select: { name: true } } } }),
    [] as Array<any>,
  );
  const contacts = await safeAdminQuery(
    "contacts-list",
    () => prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    [] as Array<any>,
  );

  return (
    <div className="space-y-6">
      <AdminSection title="الوارد والمراجعة" description="مراجعة كل مساهمة، تغيير حالتها، إضافة ملاحظات، أو تحويلها إلى مقال حقيقي في لوحة المقالات.">
        <div className="space-y-3">
          {submissions.length ? submissions.map((item: any) => (
            <details key={item.id} className="rounded-3xl bg-ivory-light p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gold">{item.type} • {item.region?.name || "غير محدد"} • {formatMakkahDateTime(item.createdAt)}</p>
                    <h3 className="font-bold">{item.title || item.fullName || "رسالة واردة"}</h3>
                    <p className="text-sm text-navy/60">{item.fullName || "بدون اسم"} {item.email ? `• ${item.email}` : ""} {item.phone ? `• ${item.phone}` : ""}</p>
                  </div>
                  <StatusBadge tone={item.status === "PUBLISHED" ? "success" : item.status === "REJECTED" ? "danger" : "warning"}>{item.status}</StatusBadge>
                </div>
              </summary>
              <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-7 text-navy/75">{item.body}</p>
              {item.reviewNotes ? <p className="mt-3 rounded-2xl bg-gold/10 p-3 text-sm font-bold text-navy">ملاحظات: {item.reviewNotes}</p> : null}
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <form action={updateSubmissionStatus} className="grid gap-3 rounded-2xl bg-white p-3 md:grid-cols-3">
                  <input type="hidden" name="id" value={item.id} />
                  <select name="status" defaultValue={item.status} className="input-field">{submissionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
                  <input name="reviewNotes" defaultValue={item.reviewNotes || ""} placeholder="ملاحظات المراجعة" className="input-field" />
                  <SubmitButton>تحديث الحالة</SubmitButton>
                </form>
                <form action={convertSubmissionToPost} className="rounded-2xl bg-white p-3">
                  <input type="hidden" name="id" value={item.id} />
                  <SubmitButton>تحويل إلى مقال للمراجعة</SubmitButton>
                </form>
              </div>
            </details>
          )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا يوجد وارد بعد.</p>}
        </div>
      </AdminSection>

      <AdminSection title="رسائل التواصل" description="تغيير حالة رسائل التواصل حتى يعرف فريق الإدارة ما تمت معالجته.">
        <div className="space-y-3">
          {contacts.length ? contacts.map((item: any) => (
            <details key={item.id} className="rounded-3xl bg-ivory-light p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gold">{formatMakkahDateTime(item.createdAt)}</p>
                    <h3 className="font-bold">{item.subject || "رسالة تواصل"}</h3>
                    <p className="text-sm text-navy/60">{item.name} {item.email ? `• ${item.email}` : ""}</p>
                  </div>
                  <StatusBadge>{item.status}</StatusBadge>
                </div>
              </summary>
              <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-7 text-navy/75">{item.message}</p>
              {item.email ? <Link href={`mailto:${item.email}`} className="mt-3 inline-flex rounded-xl bg-hope/10 px-4 py-2 text-sm font-bold text-hope">رد بالبريد</Link> : null}
              <form action={updateContactStatus} className="mt-3 flex flex-wrap gap-3 rounded-2xl bg-white p-3">
                <input type="hidden" name="id" value={item.id} />
                <select name="status" defaultValue={item.status} className="input-field max-w-xs"><option value="new">new</option><option value="read">read</option><option value="replied">replied</option><option value="archived">archived</option></select>
                <SubmitButton>تحديث</SubmitButton>
              </form>
            </details>
          )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا توجد رسائل تواصل بعد.</p>}
        </div>
      </AdminSection>
    </div>
  );
}
