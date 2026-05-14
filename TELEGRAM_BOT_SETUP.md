# إعداد بوت تليجرام لمنصة مدى الناس

## الفكرة

البوت يسمح للإدارة بإنشاء مقال عبر خطوات متتالية من تليجرام:

1. `/newpost`
2. إرسال العنوان
3. إرسال المقتطف
4. إرسال نص المقال
5. إرسال اسم الكاتب
6. إرسال صورة الغلاف أو رابطها أو كلمة `تخطي`
7. اختيار التصنيف بالرقم أو الاسم
8. اختيار النشر: `الآن` أو موعد بتوقيت مكة مثل `2026-05-13 18:30`
9. كتابة `تأكيد`

بعد النشر يرسل البوت ملخص المقال إلى قناة تليجرام المحددة في `TELEGRAM_CHANNEL_ID`، ويحفظ سجل الإرسال في `TelegramPublishLog`.

## متغيرات البيئة

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_ADMIN_IDS=123456789,987654321
TELEGRAM_CHANNEL_ID=@your_channel_username
CRON_SECRET=
NEXT_PUBLIC_SITE_URL=https://your-domain.com
APP_TIMEZONE=Asia/Riyadh
```

## إنشاء Webhook

بعد نشر الموقع على Vercel وضبط المتغيرات، نفذ طلب POST إلى:

```bash
curl -X POST "https://your-domain.com/api/telegram/set-webhook" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

سيتم ربط تليجرام بالمسار:

```text
/api/telegram/webhook
```

## جدولة النشر

Vercel Cron يستدعي:

```text
/api/cron/publish-scheduled
```

كل 10 دقائق. المسار ينشر المقالات ذات الحالة `SCHEDULED` عندما يحين وقتها، ثم يرسلها للقناة.

## الأمان

- `TELEGRAM_ADMIN_IDS` يحدد من يحق له استخدام البوت.
- `TELEGRAM_WEBHOOK_SECRET` يتحقق من مصدر طلبات تليجرام.
- `CRON_SECRET` يحمي تشغيل Webhook setup وCron اليدوي.
- لا تضع `TELEGRAM_BOT_TOKEN` أو `SUPABASE_SERVICE_ROLE_KEY` في أي Client Component.
