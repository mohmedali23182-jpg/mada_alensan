# احتياجات قاعدة البيانات بعد التحديث

## 1. متغيرات مطلوبة

ضع هذه القيم في Vercel Environment Variables و GitHub Secrets:

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=media
ADMIN_EMAIL=admin@madannas.org
ADMIN_PASSWORD=
ADMIN_NAME=مدير مدى الناس
MOATAZ_ADMIN_PASSWORD=your_moataz_admin_password
AUTH_SECRET=
SESSION_COOKIE_NAME=mada_session
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME=مدى الإنسان
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_IDS=
TELEGRAM_CHANNEL_ID=
TELEGRAM_WEBHOOK_SECRET=
CRON_SECRET=
APP_TIMEZONE=Asia/Riyadh
ADMIN_NOTIFICATION_EMAIL=
RESEND_API_KEY=
EMAIL_FROM=Mada Al-Nas <onboarding@resend.dev>
```

## 2. أوامر قاعدة البيانات

بعد ضبط `DATABASE_URL` و `DIRECT_URL`:

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run cleanup:demo
npm run build
```

## 3. ما ينشئه `seed`

- حساب الأدمن من متغيرات `ADMIN_EMAIL` و `ADMIN_PASSWORD`.
- حساب أدمن إضافي: `mtzallqmy@gmail.com` بكلمة مرور `MOATAZ_ADMIN_PASSWORD` إذا ضبطت هذا المتغير في بيئة النشر.
- الأقسام الأساسية: الأخبار الإنسانية، حياة الناس، قصة وكفاح، رسالة إنسان، قضايا وملفات، أقلام الناس.
- مناطق يمنية أساسية.
- إعدادات هوية الموقع.

## 4. تنظيف المحتوى التجريبي

`npm run cleanup:demo` يحذف:

- المقالات التجريبية.
- القضايا التجريبية.
- القصص والوارد التجريبي.
- الكتّاب الوهميين.
- رسائل التواصل التجريبية.

ويبقي حسابات الأدمن والأقسام الأساسية.

## 5. إشعارات البريد

عند إضافة مقال أو قصة أو بلاغ أو رسالة تواصل، يحفظ النظام البيانات في قاعدة البيانات ويرسل إشعارًا للبريد إذا كانت هذه المتغيرات مضبوطة:

```env
ADMIN_NOTIFICATION_EMAIL=
RESEND_API_KEY=
EMAIL_FROM=
```

بدون `RESEND_API_KEY` لن يفشل النموذج، لكنه سيكتفي بالحفظ في قاعدة البيانات وتسجيل ActivityLog.
