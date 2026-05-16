import Link from "next/link";
import { BarChart3, Bell, BookOpen, Bot, FolderOpen, Home, Image, Mail, MessageSquare, PenTool, Settings, Share2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "الرئيسية", icon: Home },
  { href: "/admin/articles", label: "المقالات", icon: BookOpen },
  { href: "/admin/categories", label: "الأقسام", icon: FolderOpen },
  { href: "/admin/authors", label: "الكتّاب", icon: PenTool },
  { href: "/admin/cases", label: "القضايا", icon: BarChart3 },
  { href: "/admin/submissions", label: "الوارد", icon: Mail },
  { href: "/admin/media", label: "الوسائط", icon: Image },
  { href: "/admin/social-links", label: "التواصل", icon: Share2 },
  { href: "/admin/telegram", label: "بوت تليجرام", icon: Bot },
  { href: "/admin/notifications", label: "الإشعارات", icon: Bell },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function AdminShell({ children, user }: { children: React.ReactNode; user?: { name: string; email: string; role: string } | null }) {
  return (
    <div className="min-h-screen bg-ivory-light text-navy" dir="rtl">
      <aside className="fixed right-0 top-0 z-40 hidden h-screen w-72 border-l border-navy/10 bg-white/95 p-5 shadow-xl lg:block">
        <Link href="/" className="mb-8 block rounded-3xl bg-navy p-5 text-white">
          <span className="block font-kufi text-2xl font-bold">مدى الإنسان</span>
          <span className="mt-1 block text-sm text-white/70">لوحة الإدارة</span>
        </Link>
        <nav className="space-y-2">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-navy/75 transition hover:bg-ivory hover:text-navy")}>
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pr-72">
        <header className="sticky top-0 z-30 border-b border-navy/10 bg-ivory-light/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gold">CMS</p>
              <h1 className="font-kufi text-xl font-black text-navy">إدارة منصة مدى الإنسان</h1>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy shadow-sm">
              <MessageSquare className="h-4 w-4 text-hope" />
              <span>{user?.name || "نسخة تكامل أولية"}</span>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {adminNav.map((item) => <Link key={item.href} href={item.href} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">{item.label}</Link>)}
          </nav>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
