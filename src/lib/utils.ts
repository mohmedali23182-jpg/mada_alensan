import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ArticleCategory, CaseStatus, CaseType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// تحويل التاريخ إلى عربي
export function formatDateArabic(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// وقت القراءة
export function formatReadingTime(minutes: number): string {
  return `${minutes} دقائق قراءة`;
}

// تسمية الفئة
export function getCategoryLabel(category: ArticleCategory): string {
  const labels: Record<ArticleCategory, string> = {
    news: "الأخبار الإنسانية",
    life: "حياة الناس",
    stories: "قصة وكفاح",
    letters: "رسالة إنسان",
    issues: "قضايا وملفات",
    opinions: "أقلام الناس",
  };
  return labels[category] ?? category;
}

// رابط الفئة
export function getCategoryHref(category: ArticleCategory): string {
  const hrefs: Record<ArticleCategory, string> = {
    news: "/news",
    life: "/life",
    stories: "/stories",
    letters: "/letters",
    issues: "/issues",
    opinions: "/opinions",
  };
  return hrefs[category] ?? "/";
}

// لون الفئة
export function getCategoryColor(category: ArticleCategory): string {
  const colors: Record<ArticleCategory, string> = {
    news: "badge-urgent",
    life: "badge-hope",
    stories: "badge-gold",
    letters: "badge-teal",
    issues: "badge-navy",
    opinions: "badge-gold",
  };
  return colors[category] ?? "badge-navy";
}

// حالة القضية
export function getCaseStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    urgent: "عاجل",
    "under-review": "قيد المراجعة",
    "in-progress": "قيد المتابعة",
    resolved: "تم الحل",
  };
  return labels[status] ?? status;
}

export function getCaseStatusColor(status: CaseStatus): string {
  const colors: Record<CaseStatus, string> = {
    urgent: "badge-urgent",
    "under-review": "badge-gold",
    "in-progress": "badge-teal",
    resolved: "badge-hope",
  };
  return colors[status] ?? "badge-navy";
}

// نوع القضية
export function getCaseTypeLabel(type: CaseType): string {
  const labels: Record<CaseType, string> = {
    poverty: "فقر",
    disease: "مرض",
    displacement: "نزوح",
    education: "تعليم",
    housing: "سكن",
    other: "أخرى",
  };
  return labels[type] ?? type;
}

// مستوى العاجلية
export function getUrgencyLabel(level: 1 | 2 | 3): string {
  const labels = { 1: "منخفض", 2: "متوسط", 3: "عالٍ" };
  return labels[level];
}

export function getUrgencyColor(level: 1 | 2 | 3): string {
  const colors = { 1: "badge-hope", 2: "badge-gold", 3: "badge-urgent" };
  return colors[level];
}

// اختصار النص
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

// بناء metadata لكل صفحة (جاهز لـ SEO)
export function buildMetadata(options: {
  title: string;
  description: string;
  slug?: string;
  image?: string;
  keywords?: string[];
}) {
  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords?.join(", "),
    openGraph: {
      title: options.title,
      description: options.description,
      images: options.image ? [{ url: options.image }] : [],
      locale: "ar_SA",
      type: "article" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: options.title,
      description: options.description,
      images: options.image ? [options.image] : [],
    },
  };
}
