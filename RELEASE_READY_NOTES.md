# Madaalinsan release-ready patch

هذه النسخة تضيف إصلاحات عملية بدون تغيير الهوية أو كسر نشر Vercel:

- رفع وسائط فعلي من الهاتف والكمبيوتر عبر `/api/upload` و Supabase Storage.
- دعم صور الغلاف والصور المصغرة للمقالات من لوحة الإدارة.
- مكتبة وسائط فعلية تقرأ من جدول `Media`.
- تحسين إنشاء روابط المقالات `slug` وجعلها فريدة تلقائيًا.
- إضافة `canonicalUrl` تلقائيًا لكل مقال.
- منع تكرار إرسال المقال إلى قناة Telegram عبر جدول `TelegramPublishLog` دون الحاجة لأعمدة إضافية في جدول Post.
- تحسين كرون النشر المجدول بحيث لا يعالج المقال نفسه أكثر من مرة.
- إضافة `/api/telegram/status` لفحص تهيئة البوت بدون كشف الأسرار.
- إبقاء `vercel.json` متوافقًا مع خطة Hobby، مع GitHub Action اختياري لتشغيل النشر المجدول كل 15 دقيقة.

## أوامر التشغيل بعد رفعها إلى GitHub

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run cleanup:demo
npm run build
```

## مهم بعد تعديل Prisma

تمت إضافة حقول جديدة إلى جدول `Post`:

- يستخدم النظام جدول `TelegramPublishLog` لتسجيل إرسال المقالات إلى تليجرام ومنع التكرار.

لذلك يجب تشغيل:

```bash
npx prisma db push
```

## تفعيل الويبهوك

بعد النشر على Vercel، شغل:

```bash
curl -X POST "https://YOUR_DOMAIN/api/telegram/set-webhook" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

ثم افحص:

```text
/api/telegram/status
```

## ملاحظة أسرار

لا ترفع `.env` إلى GitHub. استخدم Vercel Variables و GitHub Secrets فقط.
