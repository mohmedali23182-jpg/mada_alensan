import { revalidatePath } from "next/cache";
import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { MediaUploadInput } from "@/components/admin/MediaUploadInput";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";
import { makeSlug } from "@/lib/slug";
import { formatMakkahDateTime } from "@/lib/date";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const caseStatuses = ["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "PUBLISHED", "CONTACTED", "IN_PROGRESS", "RESOLVED", "REJECTED"] as const;

async function uniqueCaseSlug(input: string, currentId?: string) {
  const base = makeSlug(input || "case");
  let slug = base;
  let counter = 2;
  while (true) {
    const existing = await prisma.case.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${counter++}`;
  }
}

function caseStatus(value: FormDataEntryValue | null) {
  const status = String(value || "SUBMITTED");
  return (caseStatuses as readonly string[]).includes(status) ? status : "SUBMITTED";
}

async function saveCase(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title || !description) throw new Error("العنوان والوصف مطلوبان");
  const slug = await uniqueCaseSlug(String(formData.get("slug") || title).trim(), id || undefined);
  const regionId = String(formData.get("regionId") || "").trim() || null;
  const status = caseStatus(formData.get("status"));
  const data = {
    title,
    slug,
    type: String(formData.get("type") || "humanitarian").trim() || "humanitarian",
    description,
    fullDescription: String(formData.get("fullDescription") || "").trim() || null,
    urgencyLevel: Math.min(5, Math.max(1, Number(formData.get("urgencyLevel") || 1))),
    status: status as never,
    responsibleEntity: String(formData.get("responsibleEntity") || "").trim() || null,
    contactPerson: String(formData.get("contactPerson") || "").trim() || null,
    coverImage: String(formData.get("coverImage") || "").trim() || null,
    regionId,
    seoTitle: String(formData.get("seoTitle") || "").trim() || title,
    seoDescription: String(formData.get("seoDescription") || "").trim() || description.slice(0, 160),
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    lastUpdated: new Date(),
  };
  if (id) await prisma.case.update({ where: { id }, data });
  else await prisma.case.create({ data });
  revalidatePath("/admin/cases");
  revalidatePath("/issues");
  revalidatePath("/");
}

async function addCaseUpdate(formData: FormData) {
  "use server";
  const caseId = String(formData.get("caseId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!caseId || !title || !body) return;
  const statusValue = String(formData.get("status") || "");
  await prisma.caseUpdate.create({ data: { caseId, title, body, status: statusValue ? (caseStatus(statusValue) as never) : null } });
  await prisma.case.update({ where: { id: caseId }, data: { lastUpdated: new Date(), ...(statusValue ? { status: caseStatus(statusValue) as never } : {}) } });
  revalidatePath("/admin/cases");
  revalidatePath("/issues");
}

async function archiveCase(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  if (!id) return;
  await prisma.case.update({ where: { id }, data: { status: "REJECTED" as never, deletedAt: new Date() } });
  revalidatePath("/admin/cases");
  revalidatePath("/issues");
}

export default async function AdminCasesPage() {
  const [cases, regions] = await Promise.all([
    safeAdminQuery("cases-list", () => prisma.case.findMany({ include: { region: true, updates: { orderBy: { createdAt: "desc" }, take: 3 } }, orderBy: [{ urgencyLevel: "desc" }, { updatedAt: "desc" }], take: 50 }), [] as Array<any>),
    safeAdminQuery("regions-list", () => prisma.region.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }), [] as Array<any>),
  ]);

  return (
    <div className="space-y-6">
      <AdminSection title="إضافة قضية" description="إنشاء ملف قضية فعلي مع حالة متابعة، منطقة، أولوية، تحديثات، وصورة غلاف.">
        <form action={saveCase} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input name="title" required placeholder="عنوان القضية" className="input-field xl:col-span-2" />
          <input name="slug" dir="ltr" placeholder="slug اختياري" className="input-field" />
          <input name="type" defaultValue="humanitarian" placeholder="نوع القضية" className="input-field" />
          <select name="regionId" className="input-field"><option value="">المنطقة</option>{regions.map((region: any) => <option key={region.id} value={region.id}>{region.name}</option>)}</select>
          <select name="status" defaultValue="SUBMITTED" className="input-field">{caseStatuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <input name="urgencyLevel" type="number" min="1" max="5" defaultValue={1} className="input-field" />
          <input name="responsibleEntity" placeholder="الجهة المعنية" className="input-field" />
          <input name="contactPerson" placeholder="شخص التواصل" className="input-field" />
          <div className="md:col-span-2"><MediaUploadInput name="coverImage" label="صورة القضية" folder="cases" /></div>
          <textarea name="description" required placeholder="وصف مختصر" className="textarea-field md:col-span-2" />
          <textarea name="fullDescription" placeholder="تفاصيل كاملة" className="textarea-field md:col-span-2" />
          <input name="seoTitle" placeholder="عنوان SEO" className="input-field md:col-span-2" />
          <input name="seoDescription" placeholder="وصف SEO" className="input-field md:col-span-2" />
          <SubmitButton className="xl:w-fit">حفظ القضية</SubmitButton>
        </form>
      </AdminSection>

      <AdminSection title="إدارة القضايا" description="تعديل الحالة والبيانات وإضافة تحديثات متابعة حقيقية تظهر في قاعدة البيانات.">
        <div className="space-y-4">
          {cases.length ? cases.map((item: any) => (
            <div key={item.id} className="rounded-3xl bg-ivory-light p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="font-bold">{item.title}</h3><p className="mt-1 text-sm text-navy/60">{item.region?.name || "غير محدد"} • مستوى {item.urgencyLevel} • آخر تحديث {formatMakkahDateTime(item.lastUpdated)}</p></div>
                <StatusBadge tone={item.status === "RESOLVED" ? "success" : item.urgencyLevel >= 3 ? "danger" : "warning"}>{item.status}</StatusBadge>
              </div>
              <form action={saveCase} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input type="hidden" name="id" value={item.id} />
                <input name="title" defaultValue={item.title} className="input-field xl:col-span-2" />
                <input name="slug" dir="ltr" defaultValue={item.slug} className="input-field" />
                <input name="type" defaultValue={item.type} className="input-field" />
                <select name="regionId" defaultValue={item.regionId || ""} className="input-field"><option value="">المنطقة</option>{regions.map((region: any) => <option key={region.id} value={region.id}>{region.name}</option>)}</select>
                <select name="status" defaultValue={item.status} className="input-field">{caseStatuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                <input name="urgencyLevel" type="number" min="1" max="5" defaultValue={item.urgencyLevel} className="input-field" />
                <input name="responsibleEntity" defaultValue={item.responsibleEntity || ""} className="input-field" />
                <input name="contactPerson" defaultValue={item.contactPerson || ""} className="input-field" />
                <div className="md:col-span-2"><MediaUploadInput name="coverImage" label="صورة القضية" folder="cases" defaultValue={item.coverImage} /></div>
                <textarea name="description" defaultValue={item.description} className="textarea-field md:col-span-2" />
                <textarea name="fullDescription" defaultValue={item.fullDescription || ""} className="textarea-field md:col-span-2" />
                <input name="seoTitle" defaultValue={item.seoTitle || ""} className="input-field md:col-span-2" />
                <input name="seoDescription" defaultValue={item.seoDescription || ""} className="input-field md:col-span-2" />
                <SubmitButton>تحديث القضية</SubmitButton>
              </form>
              <form action={addCaseUpdate} className="mt-4 grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-4">
                <input type="hidden" name="caseId" value={item.id} />
                <input name="title" placeholder="عنوان التحديث" className="input-field" />
                <select name="status" defaultValue="" className="input-field"><option value="">بدون تغيير الحالة</option>{caseStatuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                <textarea name="body" placeholder="نص التحديث" className="textarea-field md:col-span-2" />
                <SubmitButton>إضافة تحديث</SubmitButton>
              </form>
              {item.updates?.length ? <div className="mt-3 space-y-2 text-sm text-navy/65">{item.updates.map((u: any) => <p key={u.id} className="rounded-xl bg-white px-3 py-2"><b>{u.title}</b> • {formatMakkahDateTime(u.createdAt)}</p>)}</div> : null}
              <form action={archiveCase} className="mt-3"><input type="hidden" name="id" value={item.id} /><button className="rounded-xl bg-urgent/10 px-5 py-2 text-sm font-bold text-urgent">أرشفة القضية</button></form>
            </div>
          )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا توجد قضايا بعد.</p>}
        </div>
      </AdminSection>
    </div>
  );
}
