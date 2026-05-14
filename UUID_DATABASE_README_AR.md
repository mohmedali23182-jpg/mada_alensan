# تشغيل قاعدة بيانات مدى الإنسان بنظام UUID

هذه النسخة تجعل مصدر قاعدة البيانات هو:

```txt
prisma/schema.prisma
```

كل الجداول الأساسية تستخدم UUID حقيقيًا في PostgreSQL:

```prisma
id String @id @default(uuid()) @db.Uuid
```

## الخطوات الصحيحة من الصفر

### 1. تنظيف Supabase القديم

افتح Supabase SQL Editor وشغّل الملف:

```txt
supabase/00-reset-public-clean.sql
```

هذا يحذف جداول `public` القديمة التي كانت مبنية على `text/cuid`.

### 2. إنشاء الجداول الجديدة من Prisma

من GitHub Codespaces أو جهازك داخل المشروع:

```bash
npm install
npm run db:setup
```

هذا ينفذ:

```bash
prisma generate
prisma db push --accept-data-loss
prisma db seed
```

### 3. إنشاء Bucket الوسائط في Supabase Storage

إذا كان رفع الصور مطلوبًا، شغّل من Supabase SQL Editor:

```txt
supabase/02-create-storage-bucket.sql
```

وتأكد أن متغير البيئة هو:

```env
SUPABASE_STORAGE_BUCKET=media
```

### 4. فحص القاعدة

```bash
npm run db:verify:uuid
```

أو من Supabase SQL Editor شغّل:

```txt
supabase/01-verify-uuid-schema.sql
```

### 5. فحص الأدمن

الأدمن يتأسس من متغيرات البيئة:

```env
ADMIN_EMAIL=mtzallqmy@gmail.com
ADMIN_PASSWORD=...
MOATAZ_ADMIN_PASSWORD=...
```

بعد `db:setup` يجب أن تجد المستخدم داخل جدول `User` ومعرّفه من نوع `uuid`.

## مهم

لا تنشئ الجداول يدويًا جدولًا جدولًا إلا للطوارئ. المصدر الرسمي هو Prisma.
أي تعديل مستقبلي على قاعدة البيانات يجب أن يبدأ من:

```txt
prisma/schema.prisma
```
