import Link from "next/link";

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  return (
    <main className="min-h-screen bg-ivory-light px-4 py-12 text-navy" dir="rtl">
      <div className="mx-auto max-w-md rounded-[2rem] border border-navy/10 bg-white p-6 shadow-xl">
        <Link href="/" className="font-kufi text-3xl font-black text-navy">مدى الإنسان</Link>
        <p className="mt-2 text-sm leading-7 text-navy/60">تسجيل دخول محرري ومديري المنصة.</p>
        {searchParams?.error ? <div className="mt-5 rounded-2xl bg-urgent/10 p-4 text-sm font-bold text-urgent">بيانات الدخول غير صحيحة أو الحساب غير مفعل.</div> : null}
        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <label className="block"><span className="text-sm font-bold">البريد الإلكتروني</span><input name="email" type="email" required className="mt-2 w-full rounded-2xl border border-navy/10 bg-ivory-light px-4 py-3 outline-none focus:border-gold" /></label>
          <label className="block"><span className="text-sm font-bold">كلمة المرور</span><input name="password" type="password" required className="mt-2 w-full rounded-2xl border border-navy/10 bg-ivory-light px-4 py-3 outline-none focus:border-gold" /></label>
          <button className="w-full rounded-2xl bg-navy px-5 py-3 font-bold text-white transition hover:bg-navy-light">دخول لوحة الإدارة</button>
        </form>
      </div>
    </main>
  );
}
