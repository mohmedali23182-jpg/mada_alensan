import Link from "next/link";
import { Mail, Globe, Camera, Send, Video, MessageCircle } from "lucide-react";
import type { ElementType } from "react";
import { MAIN_NAV } from "@/lib/navigation";
import { SOCIAL_LINKS } from "@/lib/social-links";

const iconMap: Record<string, ElementType> = {
  Facebook: Globe,
  Instagram: Camera,
  MessageCircle,
  Twitter: Globe,
  Send,
  Youtube: Video,
  Mail,
};

export default function Footer() {
  return (
    <footer className="bg-navy text-ivory/80">
      {/* الجزء الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* الشعار والوصف */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <span className="text-white font-bold text-lg font-kufi">م</span>
              </div>
              <div>
                <div className="text-white font-bold text-xl font-kufi">مدى الإنسان</div>
                <div className="text-gold text-[10px] font-tajawal opacity-80">منصة إنسانية مستقلة</div>
              </div>
            </Link>
            <p className="text-ivory/60 text-sm font-tajawal leading-relaxed mb-5">
              منصة إنسانية، اجتماعية، ثقافية، علمية، ومتنوعة تنقل قصص الناس ورسائلهم وقضاياهم بكرامة ووضوح، حتى يصل الصوت إلى من يهمه الأمر.
            </p>
            <p className="text-gold text-xs font-kufi italic">
              «نمدّ صوت الإنسان… حتى لا تبقى القصة وحيدة»
            </p>
          </div>

          {/* روابط الأقسام */}
          <div>
            <h4 className="text-white font-bold font-cairo text-sm mb-4 pb-2 border-b border-white/10">
              أقسام المنصة
            </h4>
            <ul className="space-y-2.5">
              {MAIN_NAV.slice(1, 8).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ivory/60 hover:text-gold transition-colors text-sm font-tajawal flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/40 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* روابط التفاعل */}
          <div>
            <h4 className="text-white font-bold font-cairo text-sm mb-4 pb-2 border-b border-white/10">
              شارك معنا
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "أرسل قصتك", href: "/send-story" },
                { label: "اكتب معنا", href: "/write" },
                { label: "بلّغ عن حالة", href: "/report" },
                { label: "من نحن", href: "/about" },
                { label: "تواصل معنا", href: "/contact" },
                { label: "سياسة النشر", href: "/about#policy" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ivory/60 hover:text-gold transition-colors text-sm font-tajawal flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/40 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* التواصل الاجتماعي */}
          <div>
            <h4 className="text-white font-bold font-cairo text-sm mb-4 pb-2 border-b border-white/10">
              تواصل معنا
            </h4>
            <div className="space-y-3 mb-5">
              <a
                href="mailto:info@madaalinsan.com"
                className="flex items-center gap-2 text-ivory/60 hover:text-gold transition-colors text-sm font-tajawal"
              >
                <Mail size={14} className="text-gold" />
                info@madaalinsan.com
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = iconMap[social.icon];
                return Icon ? (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-gold/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title={social.label}
                  >
                    <Icon size={15} className="text-ivory/70 hover:text-gold" />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* شريط أسفل */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-ivory/40 text-xs font-tajawal text-center">
            جميع الحقوق محفوظة © مدى الإنسان {new Date().getFullYear()} — منصة إنسانية، اجتماعية، ثقافية، علمية، ومتنوعة
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about#policy" className="text-ivory/40 hover:text-gold text-xs font-tajawal transition-colors">
              سياسة النشر
            </Link>
            <Link href="/about#privacy" className="text-ivory/40 hover:text-gold text-xs font-tajawal transition-colors">
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
