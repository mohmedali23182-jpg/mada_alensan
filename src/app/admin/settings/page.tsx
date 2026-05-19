import { revalidatePath } from "next/cache";
import { AdminSection } from "@/components/admin/AdminCards";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function saveSettings(formData: FormData) {
  "use server";
  const values = {
    siteName: String(formData.get("siteName") || "مدى الإنسان"),
    officialEmail: String(formData.get("officialEmail") || ""),
    tickerText: String(formData.get("tickerText") || ""),
    seoDescription: String(formData.get("seoDescription") || ""),
  };
  for (const [key, value] of Object.entries(values)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export default async function AdminSettingsPage() {
  const items = await safeAdminQuery("settings", () => prisma.siteSetting.findMany(), [] as Array<any>);
  const get = (key: string, fallback = "") => {
    const item = items.find((entry) => entry.key === key);
    return typeof item?.value === "string" ? item.value : fallback;
  };

  return (
    <AdminSection title="إعدادات الموقع" description="إعدادات محفوظة في قاعدة البيانات وليست حقولًا شكلية.">
      <form action={saveSettings} className="grid gap-4 md:grid-cols-2">
        <label className="block"><span className="text-sm font-bold">اسم الموقع</span><input name="siteName" className="mt-2 w-full rounded-2xl border border-navy/10 bg-ivory-light p-3" defaultValue={get("siteName", "مدى الإنسان")} /></label>
        <label className="block"><span className="text-sm font-bold">البريد الرسمي</span><input name="officialEmail" className="mt-2 w-full rounded-2xl border border-navy/10 bg-ivory-light p-3" defaultValue={get("officialEmail", "")} /></label>
        <label className="block md:col-span-2"><span className="text-sm font-bold">نص الشريط المتحرك</span><textarea name="tickerText" className="mt-2 min-h-28 w-full rounded-2xl border border-navy/10 bg-ivory-light p-3" defaultValue={get("tickerText", "أخبار إنسانية • قصص من الواقع • أقلام الناس • رسائل للجهات المعنية")} /></label>
        <label className="block md:col-span-2"><span className="text-sm font-bold">وصف SEO العام</span><textarea name="seoDescription" className="mt-2 min-h-28 w-full rounded-2xl border border-navy/10 bg-ivory-light p-3" defaultValue={get("seoDescription", "منصة إنسانية، اجتماعية، ثقافية، علمية، ومتنوعة تنقل قصص الناس وقضاياهم بكرامة ووضوح.")} /></label>
        <SubmitButton className="md:w-fit">حفظ الإعدادات</SubmitButton>
      </form>
    </AdminSection>
  );
}
