import Link from "next/link";
import { PenLine, ArrowLeft } from "lucide-react";

export default function WriteWithUsBanner() {
  return (
    <div className="bg-gradient-to-l from-navy to-navy-light rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
      {/* خلفية زخرفية */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-hope/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="w-14 h-14 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PenLine size={26} className="text-gold" />
        </div>
        <h3 className="text-white text-xl md:text-2xl font-bold font-cairo mb-3">
          هل لديك مقال يلامس حياة الناس؟
        </h3>
        <p className="text-ivory/70 text-sm md:text-base font-tajawal leading-relaxed max-w-lg mx-auto mb-6">
          أرسل مقالك إلينا، وسننشره باسمك بعد المراجعة التحريرية. صوتك يستحق أن يُسمع.
        </p>
        <Link
          href="/write"
          className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-bold font-cairo px-7 py-3 rounded-xl transition-all duration-300 hover:shadow-gold hover:-translate-y-0.5"
        >
          إرسال مقال
          <ArrowLeft size={16} />
        </Link>
      </div>
    </div>
  );
}
