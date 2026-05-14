# نشر مدى الناس على Vercel + Supabase

## 1. متغيرات البيئة المطلوبة في Vercel

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=mada-media
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=
AUTH_SECRET=
SESSION_COOKIE_NAME=mada_session
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME=مدى الناس
```

## 2. قاعدة البيانات

استخدم Supabase Postgres:

- `DATABASE_URL`: رابط Pooler على منفذ 6543.
- `DIRECT_URL`: رابط مباشر على منفذ 5432 للمهاجرات.

## 3. أوامر محلية قبل النشر

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run build
```

## 4. بعد النشر

- افتح `/login`.
- سجل الدخول ببيانات `ADMIN_EMAIL` و `ADMIN_PASSWORD` التي استخدمتها في seed.
- افتح `/admin`.

## 5. ملاحظات Vercel

- لا تستخدم Edge Runtime مع Prisma.
- Route handlers الخاصة بالإدارة والرفع تعمل بـ `runtime = "nodejs"`.
- إن فشل build بسبب Prisma، تأكد من وجود `DATABASE_URL` و `DIRECT_URL` في Vercel.
