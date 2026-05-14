import Image from "next/image";
import { revalidatePath } from "next/cache";
import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { MediaUploadInput } from "@/components/admin/MediaUploadInput";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";
import { makeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function uniqueContributorSlug(input: string, currentId?: string) {
  const base = makeSlug(input || "author");
  let slug = base;
  let counter = 2;
  while (true) {
    const existing = await prisma.contributor.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${counter++}`;
  }
}

async function saveAuthor(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("اسم الكاتب مطلوب");
  const slug = await uniqueContributorSlug(String(formData.get("slug") || name).trim(), id || undefined);
  const data = {
    name,
    slug,
    email: String(formData.get("email") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    bio: String(formData.get("bio") || "").trim() || null,
    avatarUrl: String(formData.get("avatarUrl") || "").trim() || null,
    coverUrl: String(formData.get("coverUrl") || "").trim() || null,
    facebookUrl: String(formData.get("facebookUrl") || "").trim() || null,
    instagramUrl: String(formData.get("instagramUrl") || "").trim() || null,
    xUrl: String(formData.get("xUrl") || "").trim() || null,
    whatsappUrl: String(formData.get("whatsappUrl") || "").trim() || null,
    telegramUrl: String(formData.get("telegramUrl") || "").trim() || null,
    youtubeUrl: String(formData.get("youtubeUrl") || "").trim() || null,
    websiteUrl: String(formData.get("websiteUrl") || "").trim() || null,
    isActive: formData.get("isActive") === "on",
  };
  if (id) await prisma.contributor.update({ where: { id }, data });
  else await prisma.contributor.create({ data });
  revalidatePath("/admin/authors");
  revalidatePath("/");
}

async function archiveAuthor(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  if (!id) return;
  const posts = await prisma.post.count({ where: { contributorId: id } });
  if (posts > 0) await prisma.contributor.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } });
  else await prisma.contributor.delete({ where: { id } });
  revalidatePath("/admin/authors");
  revalidatePath("/");
}

export default async function AdminAuthorsPage() {
  const authors = await safeAdminQuery(
    "authors-list",
    () => prisma.contributor.findMany({ include: { _count: { select: { posts: true } } }, orderBy: [{ isActive: "desc" }, { createdAt: "desc" }], take: 60 }),
    [] as Array<any>,
  );

  return (
    <div className="space-y-6">
      <AdminSection title="إضافة كاتب" description="إنشاء كاتب حقيقي يظهر في المقالات وصفحات المؤلفين، مع روابطه وصورته ونبذته.">
        <form action={saveAuthor} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input name="name" required placeholder="اسم الكاتب" className="input-field" />
          <input name="slug" dir="ltr" placeholder="author-slug اختياري" className="input-field" />
          <input name="email" type="email" placeholder="البريد" className="input-field" />
          <input name="phone" placeholder="الهاتف" className="input-field" />
          <div className="md:col-span-2"><MediaUploadInput name="avatarUrl" label="الصورة الشخصية" folder="authors/avatars" /></div>
          <div className="md:col-span-2"><MediaUploadInput name="coverUrl" label="صورة الغلاف" folder="authors/covers" /></div>
          <textarea name="bio" placeholder="نبذة الكاتب" className="textarea-field md:col-span-2 xl:col-span-4" />
          <input name="facebookUrl" dir="ltr" placeholder="Facebook URL" className="input-field" />
          <input name="instagramUrl" dir="ltr" placeholder="Instagram URL" className="input-field" />
          <input name="xUrl" dir="ltr" placeholder="X URL" className="input-field" />
          <input name="telegramUrl" dir="ltr" placeholder="Telegram URL" className="input-field" />
          <input name="whatsappUrl" dir="ltr" placeholder="WhatsApp URL" className="input-field" />
          <input name="youtubeUrl" dir="ltr" placeholder="YouTube URL" className="input-field" />
          <input name="websiteUrl" dir="ltr" placeholder="Website URL" className="input-field" />
          <label className="rounded-xl bg-ivory-light px-4 py-3 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> نشط</label>
          <SubmitButton className="xl:w-fit">حفظ الكاتب</SubmitButton>
        </form>
      </AdminSection>

      <AdminSection title="إدارة الكتّاب" description="تعديل، تعطيل، أو حذف الكاتب إن لم يكن مرتبطًا بمقالات.">
        <div className="space-y-4">
          {authors.length ? authors.map((author: any) => (
            <div key={author.id} className="rounded-3xl bg-ivory-light p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {author.avatarUrl ? <Image src={author.avatarUrl} alt={author.name} width={64} height={64} className="rounded-2xl object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold text-xl font-black text-white">{author.name[0]}</div>}
                  <div><h3 className="font-kufi font-black">{author.name}</h3><p className="text-sm text-navy/60">{author._count.posts} مقال • /authors/{author.slug}</p></div>
                </div>
                <StatusBadge tone={author.isActive ? "success" : "neutral"}>{author.isActive ? "نشط" : "معطل"}</StatusBadge>
              </div>
              <form action={saveAuthor} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input type="hidden" name="id" value={author.id} />
                <input name="name" defaultValue={author.name} className="input-field" />
                <input name="slug" dir="ltr" defaultValue={author.slug} className="input-field" />
                <input name="email" type="email" defaultValue={author.email || ""} className="input-field" />
                <input name="phone" defaultValue={author.phone || ""} className="input-field" />
                <div className="md:col-span-2"><MediaUploadInput name="avatarUrl" label="الصورة الشخصية" folder="authors/avatars" defaultValue={author.avatarUrl} /></div>
                <div className="md:col-span-2"><MediaUploadInput name="coverUrl" label="صورة الغلاف" folder="authors/covers" defaultValue={author.coverUrl} /></div>
                <textarea name="bio" defaultValue={author.bio || ""} className="textarea-field md:col-span-2 xl:col-span-4" />
                <input name="facebookUrl" dir="ltr" defaultValue={author.facebookUrl || ""} className="input-field" />
                <input name="instagramUrl" dir="ltr" defaultValue={author.instagramUrl || ""} className="input-field" />
                <input name="xUrl" dir="ltr" defaultValue={author.xUrl || ""} className="input-field" />
                <input name="telegramUrl" dir="ltr" defaultValue={author.telegramUrl || ""} className="input-field" />
                <input name="whatsappUrl" dir="ltr" defaultValue={author.whatsappUrl || ""} className="input-field" />
                <input name="youtubeUrl" dir="ltr" defaultValue={author.youtubeUrl || ""} className="input-field" />
                <input name="websiteUrl" dir="ltr" defaultValue={author.websiteUrl || ""} className="input-field" />
                <label className="rounded-xl bg-white px-4 py-3 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked={author.isActive} /> نشط</label>
                <SubmitButton>تحديث الكاتب</SubmitButton>
              </form>
              <form action={archiveAuthor} className="mt-3">
                <input type="hidden" name="id" value={author.id} />
                <button className="rounded-xl bg-urgent/10 px-5 py-2 text-sm font-bold text-urgent">حذف أو تعطيل الكاتب</button>
              </form>
            </div>
          )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا يوجد كتّاب بعد.</p>}
        </div>
      </AdminSection>
    </div>
  );
}
