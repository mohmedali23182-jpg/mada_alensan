"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAV } from "@/lib/navigation";
import TickerBar from "@/components/ui/TickerBar";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-navy/98 backdrop-blur-md shadow-lg"
          : "bg-navy"
      )}
    >
      <TickerBar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* الشعار */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg font-kufi">م</span>
            </div>
            <div>
              <div className="text-white font-bold text-xl font-kufi leading-tight tracking-wide">
                مدى الناس
              </div>
              <div className="text-gold text-[10px] font-tajawal opacity-80 leading-tight">
                منصة إنسانية مستقلة
              </div>
            </div>
          </Link>

          {/* قائمة سطح المكتب */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {MAIN_NAV.slice(0, 7).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-tajawal transition-all duration-200",
                  pathname === item.href
                    ? "text-gold bg-gold/10"
                    : "text-ivory/80 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* أزرار الأكشن */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              href="/send-story"
              className="bg-gold hover:bg-gold-dark text-white text-xs font-semibold font-cairo px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-gold hover:-translate-y-0.5"
            >
              أرسل قصتك
            </Link>
            <Link
              href="/report"
              className="bg-urgent hover:bg-urgent-dark text-white text-xs font-semibold font-cairo px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              بلّغ عن حالة
            </Link>
            <Link
              href="/write"
              className="bg-hope hover:bg-hope-dark text-white text-xs font-semibold font-cairo px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              اكتب معنا
            </Link>
          </div>

          {/* زر الموبايل */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="القائمة"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* قائمة الموبايل */}
      {mobileOpen && (
        <div className="lg:hidden bg-navy border-t border-white/10 mt-2">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-tajawal transition-colors",
                  pathname === item.href
                    ? "text-gold bg-gold/10"
                    : "text-ivory/80 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
              <Link href="/send-story" className="btn-primary justify-center text-center">
                أرسل قصتك
              </Link>
              <Link href="/report" className="btn-urgent justify-center text-center">
                بلّغ عن حالة
              </Link>
              <Link href="/write" className="btn-hope justify-center text-center">
                اكتب معنا
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
