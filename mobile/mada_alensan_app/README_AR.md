# تطبيق مدى الإنسان Flutter

تطبيق Android جاهز للبناء من GitHub Actions، يستدعي API الموقع:

- قراءة المقالات والأقسام.
- إرسال قصة.
- إرسال رسالة تواصل.
- الاشتراك بالنشرة.
- دخول الأدمن بنفس بريد وكلمة مرور الموقع.
- عرض مقالات الأدمن والوارد من API محمي بالتوكن.
- إنشاء/نشر مقال من التطبيق عبر API.

## البناء محليًا

```bash
cd mobile/mada_alensan_app
flutter pub get
flutter run --dart-define=API_BASE_URL=https://mada-alensan.vercel.app
```

## بناء APK

```bash
flutter build apk --debug --dart-define=API_BASE_URL=https://mada-alensan.vercel.app
```

## GitHub Actions

الملف موجود في:

```txt
.github/workflows/flutter-apk.yml
```

يبني APK ويرفعه كـ artifact باسم `mada-alensan-debug-apk`.
