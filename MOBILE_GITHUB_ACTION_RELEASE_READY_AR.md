# تقرير تجهيز GitHub Actions لبناء APK

تم ضبط بناء تطبيق Flutter في GitHub Actions ليكون مناسبًا للإصدار الحقيقي:

- تثبيت Java 17.
- تثبيت Android SDK وأدواته.
- تثبيت Flutter 3.24.5 stable.
- تشغيل `flutter precache --android`.
- إنشاء ملفات Android تلقائيًا إذا لم تكن موجودة.
- إضافة صلاحية الإنترنت لتطبيق Android بعد توليد الملفات.
- تثبيت مكتبات Flutter من `pubspec.yaml`.
- تشغيل التحليل والاختبارات.
- بناء APK release خفيف عبر `--split-per-abi`.
- رفع `app-arm64-v8a-release.apk` فقط كملف أساسي.

الأمر النهائي المستخدم:

```bash
flutter build apk --release --split-per-abi \
  --dart-define=API_BASE_URL=https://mada-alensan.vercel.app
```

اسم Artifact:

```txt
mada-alensan-arm64-release-apk
```
