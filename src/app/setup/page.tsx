import Link from "next/link";
import { checkDatabaseHealth } from "@/lib/db-health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function SetupPage() {
  const health = await checkDatabaseHealth();

  return (
    <main className="min-h-screen bg-ivory-light px-4 py-12 text-navy" dir="rtl">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-navy/10 bg-white p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gold">فحص التجهيز</p>
            <h1 className="mt-2 font-kufi text-3xl font-black">حالة قاعدة البيانات</h1>
          </div>
          <span className={`rounded-full px-4 py-2 text-sm font-black ${health.ok ? "bg-hope/10 text-hope" : "bg-urgent/10 text-urgent"}`}>
            {health.ok ? "جاهزة" : "تحتاج تجهيز"}
          </span>
        </div>

        <div className="mt-6 rounded-2xl bg-ivory-light p-5 text-sm font-bold leading-8 text-navy/80">
          {health.message}
          {health.code ? <span className="block text-xs text-navy/50">رمز الخطأ: {health.code}</span> : null}
        </div>

        {!health.ok ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm leading-8 text-navy/70">شغل هذه الأوامر مرة واحدة من GitHub Codespaces أو جهازك بعد وضع ملف .env:</p>
            <pre className="overflow-x-auto rounded-2xl bg-navy p-4 text-left text-sm text-white" dir="ltr">{`npm install
npx prisma generate
npx prisma db push --accept-data-loss
npm run seed`}</pre>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-full bg-navy px-5 py-3 text-sm font-bold text-white">تسجيل الدخول</Link>
          <Link href="/" className="rounded-full bg-ivory-light px-5 py-3 text-sm font-bold text-navy">العودة للموقع</Link>
        </div>
      </div>
    </main>
  );
}
