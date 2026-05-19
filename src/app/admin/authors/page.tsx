import Image from "next/image";
import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminAuthorsPage() {
  const authors = await safeAdminQuery("authors-list", () => prisma.contributor.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { createdAt: "desc" }, take: 30 }), [] as Array<any>);
  return (
    <AdminSection title="إدارة الكتّاب" description="بيانات الكتّاب تأتي من قاعدة البيانات، ويمكن إنشاؤهم من محرر المقالات أو بوت تليجرام.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {authors.length ? authors.map((author: any) => <div key={author.id} className="rounded-3xl bg-ivory-light p-5"><div className="flex items-center gap-4">{author.avatarUrl ? <Image src={author.avatarUrl} alt={author.name} width={64} height={64} className="rounded-2xl" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold text-xl font-black text-white">{author.name[0]}</div>}<div><h3 className="font-kufi font-black">{author.name}</h3><p className="text-sm text-navy/60">{author._count.posts} مقال</p></div></div><p className="mt-4 line-clamp-3 text-sm leading-7 text-navy/65">{author.bio || "لا توجد نبذة بعد."}</p><div className="mt-4"><StatusBadge tone={author.isActive ? "success" : "neutral"}>{author.isActive ? "نشط" : "معطل"}</StatusBadge></div></div>) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا يوجد كتّاب بعد. أضف اسم الكاتب عند إنشاء مقال.</p>}
      </div>
    </AdminSection>
  );
}
