import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";
import { formatMakkahDateTime } from "@/lib/date";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminSubmissionsPage() {
  const submissions = await safeAdminQuery(
    "submissions-list",
    () => prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, type: true, status: true, title: true, fullName: true, email: true, phone: true, body: true, createdAt: true },
    }),
    [] as Array<any>,
  );
  const contacts = await safeAdminQuery(
    "contacts-list",
    () => prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    [] as Array<any>,
  );

  return (
    <div className="space-y-6">
      <AdminSection title="الوارد والمراجعة" description="كل المقالات والقصص والبلاغات التي يرسلها الزوار من النماذج العامة.">
        <div className="space-y-3">
          {submissions.length ? submissions.map((item) => (
            <details key={item.id} className="rounded-3xl bg-ivory-light p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gold">{item.type} • {formatMakkahDateTime(item.createdAt)}</p>
                    <h3 className="font-bold">{item.title || item.fullName || "رسالة واردة"}</h3>
                    <p className="text-sm text-navy/60">{item.fullName || "بدون اسم"} {item.email ? `• ${item.email}` : ""} {item.phone ? `• ${item.phone}` : ""}</p>
                  </div>
                  <StatusBadge tone="warning">{item.status}</StatusBadge>
                </div>
              </summary>
              <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-7 text-navy/75">{item.body}</p>
            </details>
          )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا يوجد وارد بعد.</p>}
        </div>
      </AdminSection>

      <AdminSection title="رسائل التواصل" description="رسائل صفحة تواصل معنا محفوظة في قاعدة البيانات.">
        <div className="space-y-3">
          {contacts.length ? contacts.map((item) => (
            <details key={item.id} className="rounded-3xl bg-ivory-light p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gold">{formatMakkahDateTime(item.createdAt)}</p>
                    <h3 className="font-bold">{item.subject || "رسالة تواصل"}</h3>
                    <p className="text-sm text-navy/60">{item.name} {item.email ? `• ${item.email}` : ""}</p>
                  </div>
                  <StatusBadge>{item.status}</StatusBadge>
                </div>
              </summary>
              <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-7 text-navy/75">{item.message}</p>
            </details>
          )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا توجد رسائل تواصل بعد.</p>}
        </div>
      </AdminSection>
    </div>
  );
}
