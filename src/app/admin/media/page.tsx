import { revalidatePath } from "next/cache";
import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { MediaUploadInput } from "@/components/admin/MediaUploadInput";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function updateMedia(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  if (!id) return;
  await prisma.media.update({
    where: { id },
    data: {
      altText: String(formData.get("altText") || "").trim() || null,
      caption: String(formData.get("caption") || "").trim() || null,
      credit: String(formData.get("credit") || "").trim() || null,
    },
  });
  revalidatePath("/admin/media");
}

async function deleteMedia(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  if (!id) return;
  await prisma.postMedia.deleteMany({ where: { mediaId: id } });
  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/media");
}

export default async function AdminMediaPage() {
  const media = await safeAdminQuery("media-list", () => prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 60, include: { uploadedBy: { select: { name: true, email: true } } } }), [] as Array<any>);

  return (
    <div className="space-y-6">
      <AdminSection title="رفع وسائط جديدة" description="يدعم الصور، الفيديو، الصوت، PDF، والمستندات. يتم الرفع إلى Supabase Storage وتسجيل الملف في قاعدة البيانات.">
        <div className="max-w-2xl">
          <MediaUploadInput name="mediaUrl" label="رفع ملف إلى مكتبة الوسائط" folder="media-library" />
          <p className="mt-3 text-sm text-navy/60">بعد الرفع سيظهر الملف في المكتبة بعد تحديث الصفحة، ويمكن نسخ رابطه واستخدامه في المقالات.</p>
        </div>
      </AdminSection>

      <AdminSection title="مكتبة الوسائط" description="تحرير النص البديل والتعليق والاعتماد، وحذف الملفات غير المستخدمة.">
        {media.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {media.map((item: any) => (
              <div key={item.id} className="rounded-3xl bg-ivory-light p-5">
                {item.type === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.altText || item.filename || "media"} className="mb-4 h-40 w-full rounded-2xl object-cover" />
                ) : (
                  <div className="mb-4 flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-navy/10 to-gold/20 text-sm font-bold text-navy/60">{item.type}</div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-bold">{item.filename || item.type}</h3>
                  <StatusBadge>{item.type}</StatusBadge>
                </div>
                <p className="mt-1 truncate text-xs text-navy/50">{item.mimeType}</p>
                <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 block truncate rounded-xl bg-white px-3 py-2 text-xs font-bold text-teal">فتح/نسخ الرابط</a>
                <form action={updateMedia} className="mt-3 grid gap-2">
                  <input type="hidden" name="id" value={item.id} />
                  <input name="altText" defaultValue={item.altText || ""} placeholder="النص البديل للصورة" className="input-field" />
                  <input name="caption" defaultValue={item.caption || ""} placeholder="التعليق" className="input-field" />
                  <input name="credit" defaultValue={item.credit || ""} placeholder="حقوق الصورة" className="input-field" />
                  <SubmitButton>حفظ بيانات الوسيط</SubmitButton>
                </form>
                <form action={deleteMedia} className="mt-2"><input type="hidden" name="id" value={item.id} /><button className="rounded-xl bg-urgent/10 px-4 py-2 text-xs font-bold text-urgent">حذف السجل</button></form>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا توجد وسائط مرفوعة بعد.</p>
        )}
      </AdminSection>
    </div>
  );
}
