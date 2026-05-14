# مدى الناس — منصة إنسانية عربية مستقلة

> "نمدّ صوت الإنسان… حتى لا تبقى القصة وحيدة"

منصة إنسانية عربية مستقلة تنقل قصص الناس، مقالاتهم، رسائلهم، وقضاياهم بكرامة ووضوح.

---

## 🚀 التشغيل المحلي

### المتطلبات
- Node.js 18+
- npm أو yarn أو pnpm

### الخطوات

```bash
# 1. استنساخ المشروع
git clone https://github.com/Mtzallqmy/Madaalinsan.git
cd Madaalinsan

# 2. تثبيت الحزم
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env.local
# ثم عدّل .env.local بقيمك

# 4. تشغيل بيئة التطوير
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

---

## 📁 هيكل المشروع

```
src/
├── app/                    # صفحات Next.js App Router
│   ├── page.tsx            # الصفحة الرئيسية
│   ├── news/               # الأخبار الإنسانية
│   ├── life/               # حياة الناس
│   ├── stories/            # قصة وكفاح
│   ├── letters/            # رسالة إنسان
│   ├── issues/             # قضايا وملفات
│   │   └── [slug]/         # تفاصيل القضية
│   ├── opinions/           # أقلام الناس
│   ├── articles/[slug]/    # تفاصيل المقال
│   ├── send-story/         # أرسل قصتك
│   ├── write/              # اكتب معنا
│   ├── report/             # بلّغ عن حالة
│   ├── about/              # من نحن
│   └── contact/            # تواصل معنا
│
├── components/
│   ├── layout/             # Header, Footer, PageWrapper
│   ├── home/               # مكونات الصفحة الرئيسية
│   ├── forms/              # نماذج الإرسال
│   └── ui/                 # مكونات مشتركة
│
└── lib/
    ├── types.ts            # أنواع TypeScript (CMS-ready)
    ├── mock-data.ts        # بيانات تجريبية
    ├── utils.ts            # دوال مساعدة + SEO
    ├── sections.ts         # الأقسام الديناميكية
    ├── social-links.ts     # روابط التواصل
    └── navigation.ts       # قوائم التنقل
```

---

## 🎨 الهوية البصرية

| اللون | الكود | الاستخدام |
|-------|-------|-----------|
| كحلي عميق | `#0E1B2A` | Header, النصوص الرئيسية |
| عاجي دافئ | `#F5EFE3` | الخلفيات |
| ذهبي هادئ | `#C99A3E` | الأكشن، التمييز |
| أخضر أمل  | `#2F8F6B` | الإيجابي، الحل |
| تركواز عميق | `#0F766E` | رسالة إنسان |
| أحمر ناعم | `#B84C4C` | عاجل، تنبيهات |

**الخطوط:** Noto Kufi Arabic (عناوين) · Cairo (نصوص) · Tajawal (محتوى)

---

## ⚙️ التقنيات

- **Next.js 14** — App Router
- **TypeScript** — أنواع محكمة CMS-ready
- **Tailwind CSS** — تصميم سريع
- **Lucide Icons** — أيقونات نظيفة
- **CSS Animations** — حركات خفيفة بدون مكتبات ثقيلة

---

## 🔌 الربط المستقبلي مع Supabase

البنية جاهزة للربط مع:
- **Supabase Database** — قاعدة بيانات للمقالات والقضايا
- **Supabase Auth** — نظام تسجيل دخول للمحررين
- **Supabase Storage** — رفع الصور والملفات
- **Supabase Realtime** — تحديثات مباشرة للقضايا

```typescript
// مثال: استبدال mock-data بـ Supabase
import { supabase } from "@/lib/supabase";

export async function getArticles() {
  const { data } = await supabase
    .from("articles")
    .select("*, author(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data;
}
```

---

## 📊 لوحة الإدارة (المستقبل)

هيكل لوحة الإدارة معرّف في `src/lib/navigation.ts`:
- Dashboard الإحصائيات
- إدارة المقالات (إضافة/تعديل/نشر/مسودة)
- إدارة القضايا والحالات
- إدارة الكتّاب والمحررين
- إدارة الطلبات الواردة
- إدارة الأقسام الديناميكية
- إدارة الوسائط
- إعدادات SEO لكل صفحة

---

## 🌐 النشر على Vercel

```bash
# بناء للإنتاج
npm run build

# أو نشر مباشر عبر Vercel CLI
npx vercel --prod
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 📄 الترخيص

جميع الحقوق محفوظة © مدى الناس 2026

## إضافات هذه النسخة

تم تجهيز المشروع كبنية إنتاجية أولية لمنصة "مدى الناس" تشمل:

- Prisma schema للمنصة.
- لوحة إدارة عربية RTL.
- API Routes للمقالات، الأقسام، الكتّاب، القضايا، النماذج، والوسائط.
- Auth بسيط للأدمن عبر cookie آمن.
- Supabase Storage helper.
- Telegram editorial bot لإنشاء المقالات خطوة بخطوة.
- Vercel Cron لنشر المقالات المجدولة وإرسالها إلى قناة تليجرام.

راجع:

- `CMS-INTEGRATION-NOTES.md`
- `VERCEL_DEPLOYMENT.md`
- `TELEGRAM_BOT_SETUP.md`

### أوامر التشغيل الأساسية

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run build
npm run dev
```

### إعداد Webhook تليجرام بعد النشر

```bash
curl -X POST "https://your-domain.com/api/telegram/set-webhook" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
