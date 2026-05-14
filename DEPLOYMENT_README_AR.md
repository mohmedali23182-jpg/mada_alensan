# تعليمات النشر السليم على Vercel و Supabase

هذه النسخة مصممة لتعمل كمشروع Next.js + Prisma + Supabase PostgreSQL، مع لوحة إدارة حقيقية ومحرر ومخطط قاعدة بيانات إنتاجي.

## 1. إنشاء مستودع جديد

ارفع ملفات المشروع إلى مستودع GitHub جديد من حسابك أنت، حتى لا يمنع Vercel النشر بسبب صاحب commit مختلف.

## 2. متغيرات البيئة

انسخ ملف `.env.vercel.example` إلى متغيرات Vercel.

أهم القيم المطلوبة:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`

## 3. إنشاء الجداول في Supabase

بعد وضع ملف `.env` في Codespaces أو جهازك، شغل مرة واحدة:

```bash
npm install
npm run db:setup
npm run db:verify
```

أمر `npm run db:setup` ينفذ:

```bash
prisma generate
prisma db push --accept-data-loss
prisma db seed
```

## 4. النشر على Vercel

أمر البناء مضبوط في `package.json`:

```bash
prisma generate && next build
```

لا تجعل Vercel ينفذ `prisma db push` أثناء كل نشر. تجهيز القاعدة يكون خطوة منفصلة وآمنة.

## 5. فحص قاعدة البيانات من الموقع

بعد النشر افتح:

```txt
/setup
```

إذا كانت الجداول غير منشأة سيظهر لك تنبيه واضح بدل HTTP 500.

## 6. تسجيل الدخول

بعد تشغيل seed افتح:

```txt
/login
```

واستخدم بيانات الأدمن الموجودة في متغيرات البيئة.

## 7. ملاحظات هندسية

- صفحات الموقع تستخدم استعلامات آمنة، فإذا لم توجد بيانات لا ينهار الموقع.
- لوحة الإدارة محمية بالجلسات والصلاحيات.
- قاعدة البيانات تحتوي نماذج تحرير حقيقية: مقالات، SEO، مراجعات، workflow، وسائط، صفحات، قوائم، تعليقات، إحصائيات، تحويلات، وإعدادات.
- لا توجد عمليات إرسال غير محدودة. واجهات API تتحقق من الصلاحيات والمدخلات عبر Zod والجلسات.
