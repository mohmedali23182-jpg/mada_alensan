# تحديث الهوية والإشعارات

تم تنفيذ التعديلات التالية بدون تغيير مسارات النشر أو تسجيل الدخول أو Telegram webhook أو واجهات API القائمة.

## الهوية

- استبدال اسم المنصة من `مدى الناس` إلى `مدى الإنسان` في ملفات الموقع، seed، البيئة، والواجهة.
- اعتماد الشعار المختصر:

```txt
إنسانية - اجتماعية - ثقافية - علمية - متنوعة
```

- اعتماد الصياغة الرسمية:

```txt
مدى الإنسان منصة إنسانية، اجتماعية، ثقافية، علمية، ومتنوعة. لا تكتفي بنقل القضايا أو الأحداث، بل تقدم محتوى يحمل تنوعًا معرفيًا ورسالة سامية تخدم الإنسان والمجتمع.
```

## إشعارات المستخدمين

أضيفت طبقة Backend جاهزة للإشعارات:

- `PushDevice`
- `Notification`
- `NotificationPreference`

وأضيفت API:

```txt
POST /api/v1/push/register
GET  /api/v1/push/preferences
POST /api/v1/push/preferences
GET  /api/v1/notifications
GET  /api/v1/admin/notifications
POST /api/v1/admin/notifications/send
```

كما أضيفت صفحة إدارة:

```txt
/admin/notifications
```

إذا لم يتم ضبط Firebase بعد، يتم حفظ الإشعار في قاعدة البيانات بدون كسر الموقع. وعند إضافة متغيرات Firebase يتم إرسال الإشعارات للأجهزة المسجلة.

## متغيرات البيئة الجديدة

```env
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_SERVER_KEY=
```

## Android / Flutter

أضيف Workflow لبناء عدة إصدارات APK/AAB:

```txt
.github/workflows/flutter-apk.yml
```

ينتج:

```txt
app-arm64-v8a-release.apk
app-armeabi-v7a-release.apk
app-x86_64-release.apk
app-release.apk
app-release.aab
```

وللهواتف الحديثة استخدم:

```txt
mada-alensan-arm64-v8a-release-apk
```

## ملف SQL مساعد

أضيف ملف اختياري لإنشاء جداول الإشعارات يدويًا عند الحاجة:

```txt
supabase/03-create-notifications.sql
```

## خطوات قاعدة البيانات

بعد رفع النسخة، شغّل:

```bash
npx prisma generate
npx prisma db push --accept-data-loss
npm run seed
```

ثم اختبر:

```bash
npm run lint -- --max-warnings=0
npx tsc --noEmit
npm run build
```
