# مدى الإنسان, مرحلة CMS Scaffold

هذه النسخة تضيف طبقة CMS كاملة فوق الواجهة الحالية بدون تغيير الهوية البصرية.

## ما تمت إضافته

- Prisma schema كامل لمنصة تحريرية إنسانية.
- Seed لإنشاء أول مدير وأقسام ومناطق أساسية.
- تسجيل دخول بسيط بالبريد وكلمة المرور.
- حماية لوحة الإدارة عبر cookie موقّع.
- لوحة إدارة RTL أولية: المقالات، الأقسام، الكتّاب، القضايا، الوارد، الوسائط، السوشيال، المستخدمون، الإعدادات.
- API routes للنماذج العامة والإدارة.
- رفع ملفات عبر Supabase Storage من السيرفر فقط.
- Validators باستخدام Zod.
- SEO helpers و JSON-LD helpers.
- Sitemap و robots.
- نماذج عامة متصلة بالـ API: اكتب معنا، أرسل قصتك، بلّغ عن حالة، تواصل معنا.

## ما يحتاج ضبطًا قبل النشر

1. إنشاء مشروع Supabase.
2. إنشاء bucket باسم `media` أو تعديل `SUPABASE_STORAGE_BUCKET`.
3. وضع متغيرات البيئة في Vercel.
4. تشغيل migrate و seed.
5. مراجعة الصلاحيات وربط صفحات الإدارة ببيانات حقيقية بدل بعض جداول mock.

## أوامر التشغيل

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

## أوامر النشر

على Vercel تأكد من إضافة كل Environment Variables، ثم اترك أمر البناء:

```bash
npm run build
```

الـ build ينفذ `prisma generate` تلقائيًا قبل `next build`.

## ملاحظة مهمة

لا ترفع `SUPABASE_SERVICE_ROLE_KEY` إلى العميل. كل عمليات الرفع الحساسة موجودة في Route Handlers تعمل على Node.js runtime.
