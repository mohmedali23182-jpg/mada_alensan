// ============================================
// تعريف الأقسام الديناميكية - مدى الإنسان
// جاهز للربط بقاعدة بيانات لاحقاً
// ============================================

import type { Section } from "./types";

export const SECTIONS: Section[] = [
  {
    id: "1",
    slug: "news",
    label: "الأخبار الإنسانية",
    description: "أحدث الأخبار والتقارير الإنسانية من مختلف المناطق",
    icon: "Newspaper",
    color: "#B84C4C",
    isActive: true,
    order: 1,
  },
  {
    id: "2",
    slug: "life",
    label: "حياة الناس",
    description: "يوميات وحكايات الناس العاديين في مواجهة الحياة",
    icon: "Heart",
    color: "#2F8F6B",
    isActive: true,
    order: 2,
  },
  {
    id: "3",
    slug: "stories",
    label: "قصة وكفاح",
    description: "قصص إنسانية حقيقية عن الصمود والإرادة والأمل",
    icon: "BookOpen",
    color: "#C99A3E",
    isActive: true,
    order: 3,
  },
  {
    id: "4",
    slug: "letters",
    label: "رسالة إنسان",
    description: "رسائل مفتوحة من الناس إلى الجهات المعنية والمجتمع",
    icon: "Mail",
    color: "#0F766E",
    isActive: true,
    order: 4,
  },
  {
    id: "5",
    slug: "issues",
    label: "قضايا وملفات",
    description: "ملفات وقضايا موثقة تحتاج إلى متابعة ومعالجة",
    icon: "FolderOpen",
    color: "#0E1B2A",
    isActive: true,
    order: 5,
  },
  {
    id: "6",
    slug: "opinions",
    label: "أقلام الناس",
    description: "مقالات المشاركين والكتّاب المستقلين",
    icon: "PenLine",
    color: "#C99A3E",
    isActive: true,
    order: 6,
  },
];

export function getSectionBySlug(slug: string): Section | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}

export function getActiveSections(): Section[] {
  return SECTIONS.filter((s) => s.isActive).sort((a, b) => a.order - b.order);
}
