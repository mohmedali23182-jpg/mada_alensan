import Image from "next/image";
import Link from "next/link";
import { Camera, Globe } from "lucide-react";
import type { Author } from "@/lib/types";

interface AuthorCardProps {
  author: Author;
  articleCount?: number;
  compact?: boolean;
}

export default function AuthorCard({ author, articleCount, compact = false }: AuthorCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {author.avatar ? (
          <Image
            src={author.avatar}
            alt={author.name}
            width={40}
            height={40}
            className="rounded-full object-cover ring-2 ring-gold/30"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold font-cairo text-sm">
            {author.name[0]}
          </div>
        )}
        <div>
          <div className="font-semibold font-cairo text-navy text-sm">{author.name}</div>
          {author.role && (
            <div className="text-xs text-text-muted font-tajawal">{author.role}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory rounded-2xl p-6 flex flex-col items-center text-center gap-4">
      {author.avatar ? (
        <Image
          src={author.avatar}
          alt={author.name}
          width={80}
          height={80}
          className="rounded-full object-cover ring-4 ring-gold/20"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center text-white font-bold font-cairo text-2xl">
          {author.name[0]}
        </div>
      )}
      <div>
        <h3 className="font-bold font-cairo text-navy text-lg">{author.name}</h3>
        {author.role && (
          <span className="text-xs text-gold font-tajawal">{author.role}</span>
        )}
      </div>
      <p className="text-text-light text-sm font-tajawal leading-relaxed">{author.bio}</p>
      {articleCount !== undefined && (
        <span className="text-xs text-text-muted font-tajawal">
          {articleCount} مقال منشور
        </span>
      )}
      {author.social && (
        <div className="flex items-center gap-2">
          {author.social.facebook && (
            <a href={author.social.facebook} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-navy/10 hover:bg-gold/20 flex items-center justify-center transition-colors">
              <Globe size={14} className="text-navy" />
            </a>
          )}
          {author.social.instagram && (
            <a href={author.social.instagram} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-navy/10 hover:bg-gold/20 flex items-center justify-center transition-colors">
              <Camera size={14} className="text-navy" />
            </a>
          )}
          {author.social.twitter && (
            <a href={author.social.twitter} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-navy/10 hover:bg-gold/20 flex items-center justify-center transition-colors">
              <Globe size={14} className="text-navy" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
