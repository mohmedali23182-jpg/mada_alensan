import { revalidatePath } from "next/cache";
import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { MediaUploadInput } from "@/components/admin/MediaUploadInput";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";
import { categorySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function saveCategory(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const payload = {
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    description: String(formData.get("description") || ""),
    icon: String(formData.get("icon") || "FolderOpen"),
    color: String(formData.get("color") || "#0F766E"),
    coverImage: String(formData.get("coverImage") || ""),
    order: Number(formData.get("order") || 0),
    isActive: formData.get("isActive") === "on",
  };
  const parsed = categorySchema.extend({ coverImage: categorySchema.shape.description }).safeParse(payload);
  if (!parsed.success) throw new Error("بيانات القسم غير صحيحة");
  const data = { ...parsed.data, coverImage: payload.coverImage || null };
  if (id) await prisma.category.update({ where: { id }, data });
  else await prisma.category.upsert({ where: { slug: data.slug }, update: data, create: data });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  const posts = await prisma.post.count({ where: { categoryId: id } });
  if (posts > 0) await prisma.category.update({ where: { id }, data: { isActive: false } });
  else await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export default async function AdminCategoriesPage() {
  const categories = await safeAdminQuery("categories-list", () => prisma.category.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }], take: 50 }), [] as Array<any>);
  return (
    <div className="space-y-6">
      <AdminSection title="إضافة قسم جديد" description="الأقسام هنا فعالة وتظهر في التصنيفات والمقالات بعد الربط.">
        <form action={saveCategory} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input name="name" required placeholder="اسم القسم" className="input-field" />
          <input name="slug" required placeholder="slug مثال: human-news" dir="ltr" className="input-field" />
          <input name="icon" placeholder="Lucide icon" className="input-field" />
          <input name="color" defaultValue="#0F766E" className="input-field" />
          <input name="order" type="number" defaultValue={0} className="input-field" />
          <div className="md:col-span-2"><MediaUploadInput name="coverImage" label="صورة غلاف القسم" folder="category-covers" /></div>
          <label className="flex items-center gap-2 rounded-xl bg-ivory-light px-4 py-3 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> نشط</label>
          <textarea name="description" placeholder="وصف القسم" className="textarea-field md:col-span-2 xl:col-span-3" />
          <button className="rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white">حفظ القسم</button>
        </form>
      </AdminSection>

      <AdminSection title="الأقسام الحالية" description="يمكن تعديل أو تعطيل أو حذف الأقسام غير المرتبطة بمقالات.">
        <div className="space-y-4">
          {categories.length ? categories.map((section: any) => (
            <div key={section.id} className="rounded-3xl bg-ivory-light p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-kufi text-lg font-black">{section.name}</h3>
                <StatusBadge tone={section.isActive ? "success" : "neutral"}>{section.isActive ? "نشط" : "معطل"}</StatusBadge>
              </div>
              <form action={saveCategory} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input type="hidden" name="id" value={section.id} />
                <input name="name" defaultValue={section.name} className="input-field" />
                <input name="slug" defaultValue={section.slug} dir="ltr" className="input-field" />
                <input name="icon" defaultValue={section.icon || ""} className="input-field" />
                <input name="color" defaultValue={section.color || "#0F766E"} className="input-field" />
                <input name="order" type="number" defaultValue={section.order} className="input-field" />
                <div className="md:col-span-2"><MediaUploadInput name="coverImage" label="صورة غلاف القسم" folder="category-covers" defaultValue={section.coverImage} /></div>
                <label className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked={section.isActive} /> نشط</label>
                <textarea name="description" defaultValue={section.description || ""} className="textarea-field md:col-span-2 xl:col-span-3" />
                <button className="rounded-xl bg-hope px-5 py-3 text-sm font-bold text-white">تحديث</button>
              </form>
              <form action={deleteCategory} className="mt-3">
                <input type="hidden" name="id" value={section.id} />
                <button className="rounded-xl bg-urgent/10 px-5 py-2 text-sm font-bold text-urgent">حذف أو تعطيل القسم</button>
              </form>
            </div>
          )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا توجد أقسام بعد.</p>}
        </div>
      </AdminSection>
    </div>
  );
}
