import { AdminSection } from "@/components/admin/AdminCards";
import AdminArticlesClient from "@/components/admin/AdminArticlesClient";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminArticlesPage() {
  const [posts, categories] = await Promise.all([
    safeAdminQuery("posts", () => prisma.post.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 50,
      include: { category: true, contributor: true, tags: { include: { tag: true } } },
    }), []),
    safeAdminQuery("categories", () => prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { posts: true } } },
    }), []),
  ]);

  return (
    <div className="space-y-6">
      <AdminSection
        title="ثورة إدارة المحتوى"
        description="واجهة تفاعلية لإدارة المقالات والتصنيفات والوسائط. تعمل عبر API Routes قصيرة وآمنة مناسبة لـ Vercel Serverless."
      >
        <AdminArticlesClient initialPosts={JSON.parse(JSON.stringify(posts))} initialCategories={JSON.parse(JSON.stringify(categories))} />
      </AdminSection>
    </div>
  );
}
