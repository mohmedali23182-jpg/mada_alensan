# تقرير إصلاح API وإرسال المقال وتجهيز التطبيق

تمت إضافة/تحسين طبقة API بحيث لا تعيد ردودًا فارغة أو صفحات HTML في المسارات الحساسة، وتصبح مناسبة لاستخدام الموقع وتطبيق Android لاحقًا.

## الملفات الرئيسية المعدلة

- `src/app/api/submissions/article/route.ts`
  - إصلاح إرسال مقال `/write`.
  - حفظ الطلب في جدول `Submission` بحالة `SUBMITTED` ومصدر `WEBSITE`.
  - رفع المرفقات إلى Supabase Storage عند توفرها.
  - إرسال إشعار إداري عبر `notifyAdmin` دون إفشال الحفظ إذا فشل البريد أو Telegram.
  - إرجاع JSON دائمًا في النجاح والخطأ.

- `src/app/api/v1/submissions/route.ts`
  - API موحد للتطبيق والموقع لإرسال القصص أو المقالات.
  - يدعم `body` و`content` و`story` كأسماء محتوى.
  - يحفظ في `Submission` ويرسل إشعارًا إداريًا.

- `src/components/forms/WriteForm.tsx`
- `src/components/forms/SendStoryForm.tsx`
- `src/components/forms/ContactClient.tsx`
- `src/components/forms/ReportForm.tsx`
  - إضافة قراءة JSON آمنة حتى لا تظهر أخطاء مثل:
    `Unexpected end of JSON input`.

- `src/lib/http-json.ts`
  - helper موحد لقراءة ردود API بأمان.

- `src/app/api/v1/auth/login/route.ts`
- `src/app/api/v1/auth/me/route.ts`
  - تسجيل دخول JSON للتطبيق عبر `POST /api/v1/auth/login`.
  - إرجاع token من نوع Bearer.
  - `GET` يرجع JSON 405 بدل صفحة HTML.

- `src/lib/api-token-auth.ts`
  - تحقق Bearer Token لاستخدام APIs الإدارة من تطبيق Android.

- `src/app/api/v1/articles/route.ts`
  - دعم البحث `?q=`.
  - دعم فلترة التصنيف `?category=`.

- `src/app/api/v1/admin/dashboard/route.ts`
- `src/app/api/v1/admin/posts/route.ts`
- `src/app/api/v1/admin/posts/[id]/route.ts`
- `src/app/api/v1/admin/submissions/route.ts`
- `src/app/api/v1/admin/submissions/[id]/route.ts`
- `src/app/api/v1/admin/categories/route.ts`
- `src/app/api/v1/upload/route.ts`
  - APIs إدارة قابلة للاستخدام من تطبيق Android عبر Bearer Token.
  - إدارة المقالات، الوارد، التصنيفات، الرفع، والتحويل إلى مقال.

## الجداول المستخدمة

- `Submission`: استقبال المقالات والقصص والوارد.
- `ContactMessage`: رسائل التواصل.
- `NewsletterSubscriber`: النشرة البريدية.
- `Post`: المقالات المنشورة والمسودات.
- `PostSeo`, `PostStats`, `PostRevision`, `PostWorkflowEvent`: دعم التحرير والسيو والمراجعات.
- `Media`: الصور والمرفقات.
- `ActivityLog`: تسجيل العمليات المهمة.
- `User`: تسجيل دخول الأدمن.

## متغيرات Vercel المطلوبة

```env
DATABASE_URL=...
DIRECT_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=media
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=media
ADMIN_EMAIL=mtzallqmy@gmail.com
ADMIN_NOTIFICATION_EMAIL=mtzallqmy@gmail.com
RESEND_API_KEY=...
EMAIL_FROM=مدى الإنسان <onboarding@resend.dev>
NEXT_PUBLIC_SITE_URL=https://mada-alensan.vercel.app
NEXT_PUBLIC_APP_URL=https://mada-alensan.vercel.app
```

## اختبار إرسال المقال

1. افتح:
   `/write`
2. املأ النموذج وأرسل.
3. يجب أن تظهر رسالة نجاح:
   `تم إرسال المقال بنجاح، سنراجعه قبل النشر.`
4. في Supabase تحقق من جدول `Submission`.
5. من لوحة الأدمن افتح الوارد وحوّل المقال إلى مسودة.

## اختبار API التطبيق

```bash
curl -X POST https://mada-alensan.vercel.app/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"mtzallqmy@gmail.com","password":"كلمة_المرور"}'
```

ثم استخدم `token` مع:

```txt
Authorization: Bearer TOKEN
```

## تنبيه

لم يتم تغيير الهوية البصرية. التعديلات تركز على API، الحفظ الحقيقي، الردود الآمنة، وتجهيز التطبيق.
