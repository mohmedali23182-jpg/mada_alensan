# تحديث تحويل مدى الإنسان إلى منصة فعلية

هذه النسخة تضيف إصلاحات تشغيلية حقيقية بدون تغيير الهوية البصرية العامة.

## ما تم تحسينه

- إصلاح رفع الصور ليستخدم bucket موحد باسم `media` بدل `mada-media`.
- جعل كود الرفع يحاول إنشاء bucket تلقائيًا عبر Supabase service role إذا لم يكن موجودًا.
- إضافة SQL آمن لإنشاء bucket:
  - `supabase/02-create-storage-bucket.sql`
- إصلاح نموذج إرسال القصة:
  - validation واضح.
  - حفظ في جدول `Submission`.
  - حفظ المرفقات في `Media`.
  - تسجيل حدث في `ActivityLog`.
  - إشعار الأدمن عبر Telegram والبريد عند توفر المتغيرات.
- إصلاح نموذج التواصل:
  - يحفظ في `ContactMessage`.
  - يرسل إشعارًا للأدمن.
  - يستخدم البريد `mtzallqmy@gmail.com` للتواصل.
- إضافة API للنشرة البريدية:
  - `POST /api/newsletter`
  - `POST /api/v1/newsletter`
- إضافة طبقة API مستقبلية لتطبيق Android:
  - `GET /api/v1/articles`
  - `GET /api/v1/articles/[slug]`
  - `GET /api/v1/categories`
  - `POST /api/v1/submissions`
  - `POST /api/v1/contact`
  - `GET /api/v1/admin/submissions` مع صلاحية الأدمن
  - `GET/POST /api/v1/admin/posts` مع صلاحية الأدمن
- إزالة الصور العشوائية من الإنترنت كافتراضيات.
- إضافة placeholder محلي للغلاف:
  - `public/images/placeholder-cover.svg`
- إضافة أيقونة كاتب محلية:
  - `public/images/user-avatar.svg`
- جعل صورة الكاتب وصفته اختيارية، وعدم عرض "كاتب مشارك" تلقائيًا.
- تحسين تحويل القصة إلى مقال:
  - يحفظ المقال.
  - يربط `convertedPostId`.
  - يغير الحالة إلى `CONVERTED_TO_POST`.
  - يعيد الأدمن إلى صفحة المقالات برسالة نجاح.
- تحسين نشر/حفظ المقال:
  - بعد الحفظ يرجع إلى لوحة المقالات برسالة نجاح.
  - بعد النشر ينتقل إلى المقال المنشور.
- تحديث توصيف المنصة لتكون: إنسانية، فكرية، ثقافية.

## متغيرات مهمة في Vercel

```env
SUPABASE_STORAGE_BUCKET=media
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=media
ADMIN_EMAIL=mtzallqmy@gmail.com
ADMIN_NOTIFICATION_EMAIL=mtzallqmy@gmail.com
NEXT_PUBLIC_SITE_URL=https://mada-alensan.vercel.app
NEXT_PUBLIC_APP_URL=https://mada-alensan.vercel.app
```

## بعد الرفع

نفذ:

```bash
npm install
npx prisma generate
npx prisma db push --accept-data-loss
npm run seed
npm run build
```

ثم شغل في Supabase عند الحاجة:

```txt
supabase/02-create-storage-bucket.sql
```

## الاختبارات المطلوبة

- رفع صورة غلاف من لوحة المقالات.
- إرسال قصة من `/send-story`.
- ظهور القصة في `/admin/submissions`.
- تحويل القصة إلى مقال.
- نشر المقال وظهوره في الواجهة.
- إرسال رسالة من صفحة التواصل.
- فحص API المقالات من `/api/v1/articles`.
