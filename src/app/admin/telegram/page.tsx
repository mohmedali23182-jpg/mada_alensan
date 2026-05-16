import { MessageCircle, ShieldCheck, Clock, Send } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const requiredEnv = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
  "TELEGRAM_ADMIN_IDS",
  "TELEGRAM_CHANNEL_ID",
  "CRON_SECRET",
  "NEXT_PUBLIC_SITE_URL",
];

export default function TelegramAdminPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-navy p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3"><MessageCircle className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-white/70">إدارة التحرير عبر تليجرام</p>
            <h1 className="font-kufi text-2xl font-black">بوت مدى الإنسان</h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75">
          هذه الصفحة توضح إعدادات البوت. البوت يدعم إنشاء مقال بخطوات متتالية: العنوان، المقتطف، نص المقال، اسم الكاتب، صورة الغلاف، التصنيف، ثم النشر الفوري أو الجدولة بتوقيت مكة المكرمة.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <ShieldCheck className="mb-3 h-6 w-6 text-hope" />
          <h2 className="font-cairo text-lg font-black text-navy">أمان الوصول</h2>
          <p className="mt-2 text-sm leading-7 text-navy/60">يقبل البوت أوامر المستخدمين الموجودين فقط في TELEGRAM_ADMIN_IDS، ويتحقق من TELEGRAM_WEBHOOK_SECRET في كل طلب webhook.</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <Clock className="mb-3 h-6 w-6 text-gold" />
          <h2 className="font-cairo text-lg font-black text-navy">جدولة النشر</h2>
          <p className="mt-2 text-sm leading-7 text-navy/60">أدخل موعدًا بصيغة 2026-05-13 18:30 بتوقيت مكة، وسيقوم Cron Route بنشر المقال تلقائيًا وإرساله للقناة.</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <Send className="mb-3 h-6 w-6 text-teal" />
          <h2 className="font-cairo text-lg font-black text-navy">كاش القناة</h2>
          <p className="mt-2 text-sm leading-7 text-navy/60">بعد نشر المقال، يتم إرسال ملخص وصورة الغلاف إلى TELEGRAM_CHANNEL_ID مع حفظ سجل الإرسال في TelegramPublishLog.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="font-cairo text-xl font-black text-navy">متغيرات البيئة المطلوبة</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {requiredEnv.map((key) => (
            <div key={key} className="rounded-2xl border border-navy/10 bg-ivory-light p-4 font-mono text-sm text-navy" dir="ltr">{key}=</div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-gold/20 bg-gold/5 p-6">
        <h2 className="font-cairo text-xl font-black text-navy">أوامر البوت</h2>
        <ul className="mt-4 space-y-2 text-sm font-bold text-navy/70">
          <li><span dir="ltr">/newpost</span> إنشاء مقال جديد</li>
          <li><span dir="ltr">/topics</span> اقتراح مواضيع إنسانية</li>
          <li><span dir="ltr">/status</span> عرض حالة المسودة الحالية</li>
          <li><span dir="ltr">/cancel</span> إلغاء المسودة</li>
        </ul>
      </div>
    </div>
  );
}
