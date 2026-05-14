import Link from "next/link";
import {
  Newspaper,
  Heart,
  BookOpen,
  Mail,
  FolderOpen,
  PenLine,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Section } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  Newspaper,
  Heart,
  BookOpen,
  Mail,
  FolderOpen,
  PenLine,
};

const hrefMap: Record<string, string> = {
  news: "/news",
  life: "/life",
  stories: "/stories",
  letters: "/letters",
  issues: "/issues",
  opinions: "/opinions",
};

interface SectionCardProps {
  section: Section;
  articleCount?: number;
}

export default function SectionCard({ section, articleCount }: SectionCardProps) {
  const Icon = section.icon ? iconMap[section.icon] : BookOpen;
  const href = hrefMap[section.slug] ?? `/${section.slug}`;

  return (
    <Link href={href} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-6 h-full flex flex-col gap-4 border-b-4 border-transparent hover:border-b-gold">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${section.color}18` }}
        >
          {Icon && <Icon size={22} style={{ color: section.color }} />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold font-cairo text-navy text-base mb-2 group-hover:text-gold transition-colors">
            {section.label}
          </h3>
          {section.description && (
            <p className="text-text-light text-sm font-tajawal leading-relaxed line-clamp-2">
              {section.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-ivory-dark">
          {articleCount !== undefined && (
            <span className="text-xs text-text-muted font-tajawal">
              {articleCount} مقال
            </span>
          )}
          <span className="flex items-center gap-1 text-gold text-xs font-semibold font-cairo group-hover:gap-2 transition-all">
            تصفح
            <ArrowLeft size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
