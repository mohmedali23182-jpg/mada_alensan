# تقرير تجهيز تطبيق مدى الإنسان APK

تم دمج تطبيق Flutter داخل المشروع في:

```txt
mobile/mada_alensan_app
```

وتم تجهيز GitHub Action في:

```txt
.github/workflows/flutter-apk.yml
```

## ما يدعمه التطبيق

- استدعاء مقالات الموقع عبر API.
- عرض المقالات وتفاصيل المقال.
- عرض الأقسام وفلترة المقالات حسب القسم.
- البحث عبر `GET /api/v1/articles?q=`.
- إرسال قصة أو مقال إلى `POST /api/v1/submissions`.
- إرسال رسائل التواصل إلى `POST /api/v1/contact`.
- الاشتراك في النشرة عبر `POST /api/v1/newsletter`.
- دخول الأدمن عبر `POST /api/v1/auth/login`.
- Dashboard أدمن عبر `GET /api/v1/admin/dashboard`.
- إدارة المقالات من التطبيق.
- إدارة الوارد وتغيير الحالة والتحويل إلى مقال.

## بناء APK

من GitHub:

```txt
Actions → Build Android APK → Run workflow
```

أو محليًا:

```bash
cd mobile/mada_alensan_app
flutter pub get
flutter analyze --no-fatal-infos
flutter build apk --release --split-per-abi --dart-define=API_BASE_URL=https://mada-alensan.vercel.app
```

الملف المطلوب غالبًا:

```txt
build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
```

## متطلبات الموقع

يجب أن تكون API v1 منشورة في الموقع، خصوصًا:

```txt
/api/v1/auth/login
/api/v1/articles
/api/v1/categories
/api/v1/submissions
/api/v1/contact
/api/v1/newsletter
/api/v1/admin/dashboard
/api/v1/admin/posts
/api/v1/admin/submissions
```

