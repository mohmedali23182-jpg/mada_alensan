import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { MediaUploadInput } from "@/components/admin/MediaUploadInput";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminMediaPage() {
  const media = await safeAdminQuery("media-list", () => prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 40, include: { uploadedBy: { select: { name: true, email: true } } } }), [] as Array<any>);

  return (
    <div className="space-y-6">
      <AdminSection title="رفع وسائط جديدة" description="يدعم الصور، الفيديو، الصوت، PDF، ومستندات Word. يعمل من الهاتف والكمبيوتر عبر Supabase Storage.">
        <div className="max-w-2xl">
          <MediaUploadInput name="mediaUrl" label="رفع ملف إلى مكتبة الوسائط" folder="media-library" />
          <p className="mt-3 text-sm text-navy/60">بعد الرفع سيظهر الملف في المكتبة بعد تحديث الصفحة، ويمكن نسخ رابطه واستخدامه في المقالات.</p>
        </div>
      </AdminSection>

      <AdminSection title="مكتبة الوسائط" description="ملفات مرفوعة فعليًا ومحفوظة في قاعدة البيانات.">
        {media.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {media.map((item: any) => (
              <div key={item.id} className="rounded-3xl bg-ivory-light p-5">
                {item.type === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.altText || item.filename || "media"} className="mb-4 h-36 w-full rounded-2xl object-cover" />
                ) : (
                  <div className="mb-4 flex h-36 items-center justify-center rounded-2xl bg-gradient-to-br from-navy/10 to-gold/20 text-sm font-bold text-navy/60">{item.type}</div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-bold">{item.filename || item.type}</h3>
                  <StatusBadge>{item.type}</StatusBadge>
                </div>
                <p className="mt-1 truncate text-xs text-navy/50">{item.mimeType}</p>
                <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 block truncate rounded-xl bg-white px-3 py-2 text-xs font-bold text-teal">فتح/نسخ الرابط</a>
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
