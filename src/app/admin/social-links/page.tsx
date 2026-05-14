import { revalidatePath } from "next/cache";
import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function saveSocialLink(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  const platform = String(formData.get("platform") || "").trim();
  const label = String(formData.get("label") || platform).trim();
  const url = String(formData.get("url") || "").trim();
  if (!platform || !url) throw new Error("المنصة والرابط مطلوبان");
  const data = {
    platform,
    label,
    url,
    icon: String(formData.get("icon") || "").trim() || null,
    order: Number(formData.get("order") || 0),
    isActive: formData.get("isActive") === "on",
    showInHeader: formData.get("showInHeader") === "on",
    showInFooter: formData.get("showInFooter") === "on",
    showInContact: formData.get("showInContact") === "on",
  };
  if (id) await prisma.socialLink.update({ where: { id }, data });
  else await prisma.socialLink.create({ data });
  revalidatePath("/admin/social-links");
  revalidatePath("/");
}

export default async function AdminSocialLinksPage() {
  const links = await safeAdminQuery("social-links", () => prisma.socialLink.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }), [] as Array<any>);
  return (
    <div className="space-y-6">
      <AdminSection title="إضافة رابط تواصل" description="أضف روابط فيسبوك، واتساب، تليجرام، X، يوتيوب أو البريد.">
        <form action={saveSocialLink} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input name="platform" required placeholder="platform مثل facebook" className="input-field" />
          <input name="label" placeholder="العنوان الظاهر" className="input-field" />
          <input name="url" required dir="ltr" placeholder="https://..." className="input-field xl:col-span-2" />
          <input name="icon" placeholder="اسم الأيقونة اختياري" className="input-field" />
          <input name="order" type="number" defaultValue={0} className="input-field" />
          <label className="rounded-xl bg-ivory-light px-4 py-3 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> نشط</label>
          <label className="rounded-xl bg-ivory-light px-4 py-3 text-sm font-bold"><input name="showInHeader" type="checkbox" /> الهيدر</label>
          <label className="rounded-xl bg-ivory-light px-4 py-3 text-sm font-bold"><input name="showInFooter" type="checkbox" defaultChecked /> الفوتر</label>
          <label className="rounded-xl bg-ivory-light px-4 py-3 text-sm font-bold"><input name="showInContact" type="checkbox" defaultChecked /> التواصل</label>
          <SubmitButton>حفظ الرابط</SubmitButton>
        </form>
      </AdminSection>

      <AdminSection title="روابط التواصل الحالية" description="هذه الروابط محفوظة في قاعدة البيانات.">
        <div className="space-y-4">
          {links.length ? links.map((link) => (
            <div key={link.id} className="rounded-3xl bg-ivory-light p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div><h3 className="font-bold">{link.label}</h3><p className="text-sm text-navy/60" dir="ltr">{link.url}</p></div>
                <StatusBadge tone={link.isActive ? "success" : "neutral"}>{link.isActive ? "ظاهر" : "معطل"}</StatusBadge>
              </div>
              <form action={saveSocialLink} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input type="hidden" name="id" value={link.id} />
                <input name="platform" defaultValue={link.platform} className="input-field" />
                <input name="label" defaultValue={link.label} className="input-field" />
                <input name="url" defaultValue={link.url} dir="ltr" className="input-field xl:col-span-2" />
                <input name="icon" defaultValue={link.icon || ""} className="input-field" />
                <input name="order" type="number" defaultValue={link.order} className="input-field" />
                <label className="rounded-xl bg-white px-4 py-3 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked={link.isActive} /> نشط</label>
                <label className="rounded-xl bg-white px-4 py-3 text-sm font-bold"><input name="showInHeader" type="checkbox" defaultChecked={link.showInHeader} /> الهيدر</label>
                <label className="rounded-xl bg-white px-4 py-3 text-sm font-bold"><input name="showInFooter" type="checkbox" defaultChecked={link.showInFooter} /> الفوتر</label>
                <label className="rounded-xl bg-white px-4 py-3 text-sm font-bold"><input name="showInContact" type="checkbox" defaultChecked={link.showInContact} /> التواصل</label>
                <SubmitButton>تحديث</SubmitButton>
              </form>
            </div>
          )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا توجد روابط تواصل بعد.</p>}
        </div>
      </AdminSection>
    </div>
  );
}
