import Link from "next/link";
import { AdminSection, StatCard, StatusBadge } from "@/components/admin/AdminCards";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";
import { formatMakkahDateTime } from "@/lib/date";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  const posts = await safeAdminQuery("posts-count", () => prisma.post.count(), 0);
  const cases = await safeAdminQuery("cases-count", () => prisma.case.count(), 0);
  const contributors = await safeAdminQuery("contributors-count", () => prisma.contributor.count(), 0);
  const submissions = await safeAdminQuery("submissions-count", () => prisma.submission.count(), 0);

  const latestPosts = await safeAdminQuery(
    "latest-posts",
    () => prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        contributor: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    [] as Array<any>,
  );

  const urgentCases = await safeAdminQuery(
    "urgent-cases",
    () => prisma.case.findMany({
      orderBy: [{ urgencyLevel: "desc" }, { updatedAt: "desc" }],
      take: 5,
      select: { id: true, title: true, status: true, urgencyLevel: true, region: { select: { name: true } } },
    }),
    [] as Array<any>,
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="المقالات" value={posts} note="من قاعدة البيانات" />
        <StatCard title="القضايا" value={cases} note="ملفات فعالة" />
        <StatCard title="الكتّاب" value={contributors} note="مساهمون" />
        <StatCard title="الوارد" value={submissions} note="بانتظار المراجعة" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSection title="آخر المقالات" description="آخر ما أضيف عبر الإدارة أو بوت تليجرام، مع روابط عرض مباشرة للمقالات المنشورة.">
          <div className="space-y-3">
            {latestPosts.length ? latestPosts.map((article) => (
              <div key={article.id} className="rounded-2xl bg-ivory-light p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-navy">{article.title}</h3>
                    <p className="mt-1 text-sm text-navy/60">{article.contributor?.name || "هيئة التحرير"} • {article.category?.name || "بدون قسم"}</p>
                    <p className="mt-1 text-xs text-navy/50">{formatMakkahDateTime(article.publishedAt || article.createdAt)}</p>
                  </div>
                  <StatusBadge tone={article.status === "PUBLISHED" ? "success" : article.status === "SCHEDULED" ? "warning" : "neutral"}>{article.status}</StatusBadge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/admin/articles" className="rounded-full bg-white px-3 py-1 text-xs font-bold text-navy">إدارة المقالات</Link>
                  {article.slug && article.status === "PUBLISHED" ? <Link href={`/articles/${article.slug}`} className="rounded-full bg-hope/10 px-3 py-1 text-xs font-bold text-hope" target="_blank">عرض المقال</Link> : null}
                </div>
              </div>
            )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا توجد مقالات بعد. ابدأ من قسم المقالات.</p>}
          </div>
        </AdminSection>

        <AdminSection title="القضايا ذات الأولوية" description="ملخص سريع للقضايا التي تحتاج متابعة.">
          <div className="space-y-3">
            {urgentCases.length ? urgentCases.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-ivory-light p-4">
                <div>
                  <h3 className="font-bold text-navy">{item.title}</h3>
                  <p className="mt-1 text-sm text-navy/60">{item.region?.name || "غير محدد"} • مستوى {item.urgencyLevel}</p>
                </div>
                <StatusBadge tone={item.status === "RESOLVED" ? "success" : item.urgencyLevel >= 3 ? "danger" : "warning"}>{item.status}</StatusBadge>
              </div>
            )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا توجد قضايا بعد.</p>}
          </div>
        </AdminSection>
      </div>
    </div>
  );
}
