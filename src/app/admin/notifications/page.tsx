import { revalidatePath } from "next/cache";
import { Bell, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { selectPushTargets, sendPushNotificationToTokens } from "@/lib/push-notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function sendNotificationAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, "notifications:manage")) return;

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const type = String(formData.get("type") || "SYSTEM").trim().toUpperCase();
  const url = String(formData.get("url") || "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  if (!title || !body) return;

  const targets = await selectPushTargets(type);
  const result = await sendPushNotificationToTokens(targets.map((device) => device.token), { title, body, type, url, imageUrl });
  const notification = await prisma.notification.create({
    data: {
      title,
      body,
      type,
      url,
      imageUrl,
      target: "ALL",
      status: result.configured ? (result.failedCount ? "PARTIAL" : "SENT") : "SAVED",
      sentCount: result.sentCount,
      failedCount: result.failedCount,
      error: result.error || null,
      sentAt: result.configured ? new Date() : null,
    },
  });
  await prisma.activityLog.create({ data: { action: "notification.sent", entity: "Notification", entityId: notification.id, userId: user.id, metadata: { targets: targets.length, ...result } } }).catch(() => null);
  revalidatePath("/admin/notifications");
}

export default async function AdminNotificationsPage() {
  const [notifications, devices] = await Promise.all([
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 30 }).catch(() => []),
    prisma.pushDevice.count({ where: { enabled: true } }).catch(() => 0),
  ]);
  const firebaseReady = Boolean(process.env.FIREBASE_SERVER_KEY || (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gold">Push Notifications</p>
            <h1 className="mt-1 font-kufi text-2xl font-black text-navy">إشعارات المستخدمين</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-navy/60">أرسل خبرًا عاجلًا، تحديثًا عامًا، أو إشعار مقال جديد للأجهزة التي فعّلت الإشعارات في التطبيق.</p>
          </div>
          <div className="rounded-2xl bg-ivory px-4 py-3 text-sm font-bold text-navy">الأجهزة المفعلة: {devices}</div>
        </div>
        {!firebaseReady ? (
          <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm leading-7 text-navy">
            الإشعارات محفوظة داخل قاعدة البيانات، لكن إرسال Firebase غير مفعل بعد. أضف متغيرات Firebase في Vercel لتصل الإشعارات للهاتف.
          </div>
        ) : null}
      </section>

      <form action={sendNotificationAction} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold">عنوان الإشعار</span>
          <input name="title" required className="mt-2 w-full rounded-2xl border border-navy/10 bg-ivory-light p-3" placeholder="خبر عاجل من مدى الإنسان" />
        </label>
        <label className="block">
          <span className="text-sm font-bold">نوع الإشعار</span>
          <select name="type" className="mt-2 w-full rounded-2xl border border-navy/10 bg-ivory-light p-3">
            <option value="BREAKING_NEWS">خبر عاجل</option>
            <option value="NEW_ARTICLE">مقال جديد</option>
            <option value="UPDATE">تحديث منصة</option>
            <option value="SYSTEM">رسالة عامة</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-bold">نص الإشعار</span>
          <textarea name="body" required className="mt-2 min-h-28 w-full rounded-2xl border border-navy/10 bg-ivory-light p-3" placeholder="اكتب نصًا مختصرًا وواضحًا للمستخدمين" />
        </label>
        <label className="block">
          <span className="text-sm font-bold">رابط اختياري</span>
          <input name="url" className="mt-2 w-full rounded-2xl border border-navy/10 bg-ivory-light p-3" placeholder="/articles/example" />
        </label>
        <label className="block">
          <span className="text-sm font-bold">صورة اختيارية</span>
          <input name="imageUrl" className="mt-2 w-full rounded-2xl border border-navy/10 bg-ivory-light p-3" placeholder="https://..." />
        </label>
        <div className="md:col-span-2">
          <button className="inline-flex items-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-navy/90">
            <Send className="h-4 w-4" />
            إرسال الإشعار
          </button>
        </div>
      </form>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5">
        <h2 className="mb-4 flex items-center gap-2 font-kufi text-xl font-black"><Bell className="h-5 w-5 text-gold" /> آخر الإشعارات</h2>
        <div className="space-y-3">
          {notifications.length ? notifications.map((item) => (
            <article key={item.id} className="rounded-2xl border border-navy/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold">{item.title}</h3>
                <span className="rounded-full bg-ivory px-3 py-1 text-xs font-bold">{item.type} - {item.status}</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-navy/70">{item.body}</p>
              <p className="mt-2 text-xs text-navy/45">تم الإرسال: {item.sentCount}، فشل: {item.failedCount}</p>
              {item.error ? <p className="mt-2 text-xs text-red-600">{item.error}</p> : null}
            </article>
          )) : <p className="rounded-2xl bg-ivory p-5 text-sm text-navy/60">لا توجد إشعارات بعد.</p>}
        </div>
      </section>
    </div>
  );
}
