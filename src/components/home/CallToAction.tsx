import Link from "next/link";
import { BookOpen, PenLine, AlertTriangle } from "lucide-react";

export default function CallToAction() {
  const cards = [
    {
      icon: BookOpen,
      title: "أرسل قصتك",
      desc: "هل مررت بتجربة إنسانية تستحق أن يعرفها الناس؟ شاركنا قصتك وسننقلها للعالم.",
      href: "/send-story",
      btnLabel: "أرسل قصتك الآن",
      color: "#C99A3E",
      bg: "from-[#C99A3E]/10 to-transparent",
    },
    {
      icon: PenLine,
      title: "اكتب معنا",
      desc: "هل لديك مقال، رأي، أو تحليل إنساني؟ أرسله لنا وسننشره باسمك بعد المراجعة.",
      href: "/write",
      btnLabel: "إرسال مقال",
      color: "#2F8F6B",
      bg: "from-[#2F8F6B]/10 to-transparent",
    },
    {
      icon: AlertTriangle,
      title: "بلّغ عن حالة",
      desc: "هل تعلم عن حالة إنسانية عاجلة تحتاج إلى تدخل؟ بلّغنا وسنتابع القضية.",
      href: "/report",
      btnLabel: "بلّغ الآن",
      color: "#B84C4C",
      bg: "from-[#B84C4C]/10 to-transparent",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold font-cairo text-navy mb-3">
            شاركنا في صنع الفرق
          </h2>
          <div className="w-14 h-1 rounded-full bg-gold mx-auto mb-3" />
          <p className="text-text-light text-sm font-tajawal max-w-xl mx-auto">
            مدى الإنسان منصة تحمل تنوعًا معرفيًا ورسالة سامية تخدم الإنسان والمجتمع.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`bg-gradient-to-br ${card.bg} bg-white rounded-2xl p-7 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col gap-5`}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${card.color}18` }}
              >
                <card.icon size={22} style={{ color: card.color }} />
              </div>
              <div>
                <h3 className="font-bold font-cairo text-navy text-lg mb-2">{card.title}</h3>
                <p className="text-text-light text-sm font-tajawal leading-relaxed">{card.desc}</p>
              </div>
              <Link
                href={card.href}
                className="mt-auto inline-flex items-center justify-center font-bold font-cairo text-white text-sm px-6 py-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{ backgroundColor: card.color }}
              >
                {card.btnLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
