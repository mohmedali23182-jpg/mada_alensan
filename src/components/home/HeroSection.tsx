import Link from "next/link";
import { ArrowLeft, BookOpen, PenLine, FolderOpen } from "lucide-react";

type HeroStats = {
  stories: number;
  cases: number;
  articles: number;
  regions: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-SA").format(Math.max(0, Number(value) || 0));
}

export default function HeroSection({ stats }: { stats?: HeroStats }) {
  const safeStats = stats || { stories: 0, cases: 0, articles: 0, regions: 0 };

  return (
    <section className="relative min-h-[92vh] bg-navy flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-hope/5 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal/3 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #C99A3E 0, #C99A3E 1px, transparent 0, transparent 50%)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-gold/15 border border-gold/30 text-gold px-4 py-2 rounded-full text-sm font-semibold font-cairo mb-8">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            منصة إنسانية عربية مستقلة
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-cairo text-white leading-[1.3] mb-6">
            هنا لا تُختصر
            <span className="block text-gold mt-1">حياة الإنسان في خبر.</span>
          </h1>

          <p className="text-ivory/75 text-base md:text-lg font-tajawal leading-[2] mb-10 max-w-2xl">
            مدى الناس منصة إنسانية مستقلة تنقل قصص الناس، مقالاتهم، رسائلهم، وقضاياهم بكرامة ووضوح،
            حتى يصل الصوت إلى من يهمه الأمر.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/send-story" className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-bold font-cairo px-7 py-3.5 rounded-xl transition-all duration-300 hover:shadow-gold hover:-translate-y-0.5 text-sm">
              <BookOpen size={17} />
              أرسل قصتك
            </Link>
            <Link href="/write" className="inline-flex items-center gap-2 bg-hope hover:bg-hope-dark text-white font-bold font-cairo px-7 py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 text-sm">
              <PenLine size={17} />
              اكتب معنا
            </Link>
            <Link href="/issues" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold font-cairo px-7 py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 text-sm">
              <FolderOpen size={17} />
              تصفح القضايا
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-16 md:mt-20">
          {[
            { value: formatNumber(safeStats.stories), label: "قصة واردة", color: "#2F8F6B" },
            { value: formatNumber(safeStats.cases), label: "قضية موثقة", color: "#B84C4C" },
            { value: formatNumber(safeStats.articles), label: "مقال منشور", color: "#C99A3E" },
            { value: formatNumber(safeStats.regions), label: "منطقة مغطاة", color: "#0F766E" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold font-kufi mb-1" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-ivory/60 text-xs font-tajawal">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L1440 60L1440 20C1200 50 960 60 720 50C480 40 240 10 0 30L0 60Z" fill="#F5EFE3" />
        </svg>
      </div>
    </section>
  );
}
