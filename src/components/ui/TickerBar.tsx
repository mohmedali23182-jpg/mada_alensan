"use client";

export default function TickerBar() {
  const text =
    "أخبار إنسانية • قصص من الواقع • أقلام الناس • رسائل للجهات المعنية • قضايا الفقر والمرض والنزوح • حياة الناس كما هي • نمدّ صوت الإنسان حتى لا تبقى القصة وحيدة";

  return (
    <div className="bg-navy text-ivory-light overflow-hidden py-2 border-b border-gold/20">
      <div className="flex items-center gap-4">
        <span className="shrink-0 bg-gold text-white text-xs font-bold px-3 py-1 rounded-sm mr-2 z-10 relative font-cairo">
          عاجل
        </span>
        <div className="overflow-hidden flex-1 relative">
          <span className="ticker-text text-xs md:text-sm font-tajawal tracking-wide opacity-90">
            {text} &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; {text}
          </span>
        </div>
      </div>
    </div>
  );
}
