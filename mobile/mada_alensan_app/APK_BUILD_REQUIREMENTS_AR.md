# متطلبات بناء APK لتطبيق مدى الإنسان

هذه النسخة مجهزة ليبني GitHub Actions ملف APK خفيف بصيغة Release، وليس Debug.

## ما الذي يثبته Workflow تلقائيًا؟

الملف:

```txt
.github/workflows/flutter-apk.yml
```

يثبت ويجهز تلقائيًا:

- Ubuntu runner
- Java 17 Temurin
- Android SDK
- Android platform tools
- Android API 35
- Android Build Tools 35.0.0
- Flutter stable 3.24.5
- Pub dependencies من `pubspec.yaml`
- Android platform files عبر `flutter create` إذا لم تكن موجودة
- صلاحية الإنترنت في AndroidManifest حتى تعمل API في نسخة release

## أمر البناء المستخدم

```bash
flutter build apk --release --split-per-abi \
  --dart-define=API_BASE_URL=https://mada-alensan.vercel.app
```

## ملف APK المهم

لأغلب هواتف Android الحديثة استخدم:

```txt
app-arm64-v8a-release.apk
```

وسيظهر في GitHub Actions كـ artifact باسم:

```txt
mada-alensan-arm64-release-apk
```

## لماذا هذا APK أخف؟

لأنه:

- Release وليس Debug
- مبني بـ `--split-per-abi`
- يرفع ملف arm64 فقط للاستخدام الطبيعي
- لا يحتوي أدوات Debug غير الضرورية

## طريقة التشغيل من GitHub

```txt
GitHub → Actions → Build Android APK → Run workflow
```

يمكنك ترك رابط API الافتراضي:

```txt
https://mada-alensan.vercel.app
```

أو تغييره عند التشغيل اليدوي من خانة `api_base_url`.

## عند فشل تسجيل الدخول داخل التطبيق

افحص أن الموقع يحتوي API حقيقيًا يرجع JSON:

```txt
POST /api/v1/auth/login
GET /api/v1/auth/login
```

فتح المسار من المتصفح يجب أن يرجع JSON يوضح أن POST مطلوب، وليس صفحة 404 HTML.
