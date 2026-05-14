import Image from "next/image";
import Link from "next/link";
import { Clock, Quote, ArrowLeft } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { getCategoryLabel, formatReadingTime } from "@/lib/utils";
import type { Article } from "@/lib/types";

interface FeaturedStoryProps {
  article: Article;
}

export default function FeaturedStory({ article }: FeaturedStoryProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-card-hover bg-white">
      {/* الصورة */}
      <div className="relative h-72 lg:h-auto min-h-[380px]">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-navy/30" />
        <div className="absolute top-4 right-4">
          <Badge variant="urgent">قصة اليوم</Badge>
        </div>
      </div>

      {/* المحتوى */}
      <div className="p-8 md:p-10 flex flex-col justify-center gap-5">
        <div>
          <Badge variant="gold" className="mb-3">
            {getCategoryLabel(article.category)}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold font-cairo text-navy leading-relaxed mb-4 hover:text-gold transition-colors">
            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
          </h2>
          <p className="text-text-light text-sm md:text-base font-tajawal leading-[2] line-clamp-3">
            {article.summary}
          </p>
        </div>

        {article.quote && (
          <div className="bg-ivory rounded-xl p-5 border-r-4 border-gold relative">
            <Quote size={18} className="text-gold mb-2 opacity-60" />
            <p className="text-text font-tajawal text-sm leading-relaxed italic">
              «{article.quote}»
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-ivory-dark">
          <div className="flex items-center gap-3">
            {article.author.avatar && (
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={36}
                height={36}
                className="rounded-full object-cover ring-2 ring-gold/20"
              />
            )}
            <div>
              <div className="text-navy font-semibold font-cairo text-sm">{article.author.name}</div>
              <div className="text-text-muted text-xs font-tajawal flex items-center gap-1">
                <Clock size={11} />
                {formatReadingTime(article.readingTime)}
              </div>
            </div>
          </div>
          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center gap-1.5 bg-gold hover:bg-gold-dark text-white font-bold font-cairo px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-gold text-sm"
          >
            اقرأ القصة
            <ArrowLeft size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
