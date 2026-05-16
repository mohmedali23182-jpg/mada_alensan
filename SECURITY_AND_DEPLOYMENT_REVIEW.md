# مراجعة الأمان والتشغيل، مدى الإنسان

## ما تم تعزيزه

- إضافة Prisma schema كامل للمنصة.
- إضافة Auth بسيط عبر httpOnly cookies.
- حماية مسارات الإدارة عبر `/admin/layout.tsx`.
- إضافة API helpers للصلاحيات.
- منع تشغيل Prisma على Edge Runtime داخل API Routes الحساسة.
- إضافة Telegram webhook محمي عبر `TELEGRAM_WEBHOOK_SECRET`.
- قصر استخدام بوت تليجرام على المعرفات الموجودة في `TELEGRAM_ADMIN_IDS`.
- حماية Cron Route عبر `CRON_SECRET`.
- عدم وضع `SUPABASE_SERVICE_ROLE_KEY` في Client Components.
- إضافة GitHub Actions workflow للتأكد من البناء.
- إضافة `vercel.json` لجدولة نشر المقالات المجدولة.

## ملاحظات مهمة قبل الإنتاج

1. غيّر أي مفاتيح Supabase تم إرسالها في محادثات أو أماكن عامة.
2. لا ترفع `.env` إلى GitHub.
3. استخدم Supabase Pooler في `DATABASE_URL` على Vercel.
4. استخدم `DIRECT_URL` للاتصال المباشر الخاص بالـ migrations/db push.
5. أنشئ bucket باسم `media` في Supabase Storage.
6. شغّل:

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run build
```

7. بعد النشر على Vercel، اضبط Webhook تليجرام عبر:

```bash
curl -X POST "https://your-domain.com/api/telegram/set-webhook" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## مسارات مهمة

- `/login` تسجيل الدخول.
- `/admin` لوحة الإدارة.
- `/admin/telegram` إعدادات بوت تليجرام.
- `/api/telegram/webhook` Webhook تليجرام.
- `/api/cron/publish-scheduled` نشر المقالات المجدولة.

## الذي يحتاج اختبارًا بعد وضع المتغيرات

- تسجيل دخول الأدمن.
- إنشاء الجداول عبر Prisma.
- رفع الصور إلى Supabase Storage.
- إنشاء مقال من بوت تليجرام.
- إرسال المقال إلى قناة تليجرام.
- نشر مقال مجدول عبر Vercel Cron.
