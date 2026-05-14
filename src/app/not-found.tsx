import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="min-h-[70vh] flex items-center justify-center bg-ivory">
        <div className="text-center px-4 max-w-lg">
          <div className="text-8xl font-bold font-kufi text-gold/30 mb-4">٤٠٤</div>
          <h1 className="text-2xl font-bold font-cairo text-navy mb-4">
            الصفحة غير موجودة
          </h1>
          <p className="text-text-light font-tajawal mb-8 leading-relaxed">
            يبدو أن الصفحة التي تبحث عنها انتقلت أو لم تعد موجودة. لا بأس، دعنا نعيدك إلى البداية.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-bold font-cairo px-7 py-3 rounded-xl transition-all duration-300 hover:shadow-gold"
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
