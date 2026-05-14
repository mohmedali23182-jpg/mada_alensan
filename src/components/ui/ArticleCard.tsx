import Image from "next/image";
import Link from "next/link";
import { Clock, User } from "lucide-react";
import Badge from "./Badge";
import { getCategoryLabel, getCategoryColor, formatReadingTime } from "@/lib/utils";
import type { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact" | "horizontal";
}

export default function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const categoryColor = getCategoryColor(article.category) as "gold" | "hope" | "urgent" | "teal" | "navy";
  const badgeVariant = categoryColor.replace("badge-", "") as "gold" | "hope" | "urgent" | "teal" | "navy";

  if (variant === "featured") {
    return (
      <Link href={`/articles/${article.slug}`} className="group block">
        <div className="relative h-[480px] md:h-[560px] rounded-2xl overflow-hidden shadow-card-hover">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/40 to-transparent" />
          <div className="absolute bottom-0 right-0 left-0 p-6 md:p-8">
            <Badge variant={badgeVariant} className="mb-3">
              {getCategoryLabel(article.category)}
            </Badge>
            <h2 className="text-white text-2xl md:text-3xl font-bold font-cairo leading-relaxed mb-3 group-hover:text-gold transition-colors">
              {article.title}
            </h2>
            {article.quote && (
              <p className="text-ivory/80 text-sm font-tajawal line-clamp-2 mb-4 border-r-2 border-gold pr-3">
                {article.quote}
              </p>
            )}
            <div className="flex items-center gap-4 text-ivory/70 text-xs font-tajawal">
              <span className="flex items-center gap-1">
                <User size={12} />
                {article.author.name}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatReadingTime(article.readingTime)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/articles/${article.slug}`} className="group block">
        <div className="flex gap-4 items-start bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300">
          <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant={badgeVariant} className="mb-2 text-[10px]">
              {getCategoryLabel(article.category)}
            </Badge>
            <h3 className="font-bold font-cairo text-navy text-sm leading-relaxed line-clamp-2 group-hover:text-gold transition-colors mb-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-3 text-text-muted text-xs font-tajawal">
              <span>{article.author.name}</span>
              <span>•</span>
              <span>{formatReadingTime(article.readingTime)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/articles/${article.slug}`} className="group block">
        <div className="flex gap-3 items-center py-3 border-b border-ivory-dark last:border-0">
          <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-1" />
          <h3 className="font-semibold font-cairo text-navy text-sm leading-relaxed line-clamp-2 group-hover:text-gold transition-colors">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  // default card
  return (
    <Link href={`/articles/${article.slug}`} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-full flex flex-col overflow-hidden">
        <div className="relative h-52 overflow-hidden">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <Badge variant={badgeVariant}>{getCategoryLabel(article.category)}</Badge>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold font-cairo text-navy text-base leading-relaxed line-clamp-2 group-hover:text-gold transition-colors mb-2">
            {article.title}
          </h3>
          <p className="text-text-light text-sm font-tajawal line-clamp-2 mb-4 flex-1 leading-relaxed">
            {article.summary}
          </p>
          <div className="flex items-center justify-between text-text-muted text-xs font-tajawal border-t border-ivory-dark pt-3 mt-auto">
            <div className="flex items-center gap-1.5">
              {article.author.avatar ? (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={22}
                  height={22}
                  className="rounded-full object-cover"
                />
              ) : (
                <User size={14} />
              )}
              <span>{article.author.name}</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatReadingTime(article.readingTime)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
