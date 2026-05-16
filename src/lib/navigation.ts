// ============================================
// قائمة التنقل - مدى الإنسان
// ============================================

import type { NavItem } from "./types";

export const MAIN_NAV: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  { label: "الأخبار الإنسانية", href: "/news" },
  { label: "حياة الناس", href: "/life" },
  { label: "قصة وكفاح", href: "/stories" },
  { label: "رسالة إنسان", href: "/letters" },
  { label: "قضايا وملفات", href: "/issues" },
  { label: "أقلام الناس", href: "/opinions" },
  { label: "من نحن", href: "/about" },
  { label: "تواصل معنا", href: "/contact" },
];

export const ACTION_BTNS = [
  { label: "أرسل قصتك", href: "/send-story", variant: "gold" },
  { label: "بلّغ عن حالة", href: "/report", variant: "urgent" },
  { label: "اكتب معنا", href: "/write", variant: "hope" },
] as const;

// قائمة لوحة الإدارة (جاهزة للتطبيق لاحقاً)
export const ADMIN_NAV: NavItem[] = [
  { label: "الرئيسية", href: "/admin" },
  { label: "المقالات", href: "/admin/articles" },
  { label: "القضايا", href: "/admin/cases" },
  { label: "الكتّاب", href: "/admin/authors" },
  { label: "المحررون", href: "/admin/editors" },
  { label: "القصص الواردة", href: "/admin/submissions/stories" },
  { label: "المقالات الواردة", href: "/admin/submissions/articles" },
  { label: "البلاغات", href: "/admin/submissions/reports" },
  { label: "الأقسام", href: "/admin/sections" },
  { label: "الوسوم", href: "/admin/tags" },
  { label: "الوسائط", href: "/admin/media" },
  { label: "التواصل الاجتماعي", href: "/admin/social" },
  { label: "الإعدادات", href: "/admin/settings" },
];
