import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminCasesPage() {
  const cases = await safeAdminQuery("cases-list", () => prisma.case.findMany({ include: { region: true }, orderBy: [{ urgencyLevel: "desc" }, { updatedAt: "desc" }], take: 30 }), [] as Array<any>);
  return (
    <AdminSection title="إدارة القضايا" description="متابعة البلاغات والقضايا والحالات الإنسانية من قاعدة البيانات.">
      <div className="space-y-3">
        {cases.length ? cases.map((item: any) => <div key={item.id} className="grid gap-3 rounded-3xl bg-ivory-light p-4 md:grid-cols-[1fr_160px_140px_120px] md:items-center"><div><h3 className="font-bold">{item.title}</h3><p className="mt-1 text-sm text-navy/60 line-clamp-2">{item.description}</p></div><span className="text-sm font-bold">{item.region?.name || "غير محدد"}</span><span className="text-sm">مستوى {item.urgencyLevel}</span><StatusBadge tone={item.status === "RESOLVED" ? "success" : item.urgencyLevel >= 3 ? "danger" : "warning"}>{item.status}</StatusBadge></div>) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا توجد قضايا بعد.</p>}
      </div>
    </AdminSection>
  );
}
