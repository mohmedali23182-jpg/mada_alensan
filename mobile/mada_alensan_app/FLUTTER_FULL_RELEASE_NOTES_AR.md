# تطبيق مدى الإنسان Flutter، نسخة Release متكاملة

هذه النسخة مهيأة لتعمل كتطبيق Android متصل بواجهات API الخاصة بالموقع:

- `https://mada-alensan.vercel.app/api/v1/articles`
- `https://mada-alensan.vercel.app/api/v1/articles/[slug]`
- `https://mada-alensan.vercel.app/api/v1/categories`
- `https://mada-alensan.vercel.app/api/v1/submissions`
- `https://mada-alensan.vercel.app/api/v1/contact`
- `https://mada-alensan.vercel.app/api/v1/newsletter`
- `https://mada-alensan.vercel.app/api/v1/auth/login`
- `https://mada-alensan.vercel.app/api/v1/auth/me`
- `https://mada-alensan.vercel.app/api/v1/admin/dashboard`
- `https://mada-alensan.vercel.app/api/v1/admin/posts`
- `https://mada-alensan.vercel.app/api/v1/admin/submissions`

## الشاشات

- الرئيسية
- المقالات
- تفاصيل المقال
- الأقسام
- مقالات القسم
- البحث
- إرسال قصة أو مقال
- التواصل
- النشرة البريدية
- دخول الأدمن
- لوحة الأدمن
- إدارة المقالات
- إدارة الوارد وتحويله إلى مقال

## بناء APK خفيف

من GitHub Actions:

```txt
Actions → Build Android APK → Run workflow
```

سيتم بناء نسخة release مقسمة حسب المعمارية:

```bash
flutter build apk --release --split-per-abi --dart-define=API_BASE_URL=https://mada-alensan.vercel.app
```

الملف الأساسي للهواتف الحديثة:

```txt
app-arm64-v8a-release.apk
```

## سبب صغر الحجم

- لا يتم بناء debug APK.
- يتم استخدام `--release`.
- يتم استخدام `--split-per-abi`.
- يتم رفع arm64 فقط كملف أساسي.

## ملاحظات مهمة

إذا ظهر في التطبيق أن رابط API غير صحيح أو المسار غير منشور، فهذا يعني أن مسار API في الموقع يرجع HTML أو 404 بدل JSON. يجب إصلاح المسار في موقع Next.js لا في Flutter.

