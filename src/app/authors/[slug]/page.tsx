import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Calendar, Mail, PenLine, UserRound } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import ArticleCard from "@/components/ui/ArticleCard";
import { prisma } from "@/lib/prisma";
import { postToArticle } from "@/lib/content";
import { buildMetadata, formatDateArabic } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Props {
  params: { slug: string };
}

async function getAuthor(slug: string) {
  return prisma.contributor.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED", deletedAt: null, visibility: "PUBLIC" },
        include: {
          category: true,
          contributor: true,
          author: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { publishedAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const author = await getAuthor(params.slug);
  if (!author) return {};
  return buildMetadata({
    title: `${author.name} | كتّاب مدى الإنسان`,
    description: author.bio || "كاتب في منصة إنسانية، فكرية، ثقافية.",
    image: author.avatarUrl || undefined,
    keywords: [author.name, "مدى الإنسان", "أقلام الناس", "ثقافة", "فكر"],
  });
}

export default async function AuthorPage({ params }: Props) {
  const author = await getAuthor(params.slug);
  if (!author) notFound();
  const authorArticles = author.posts.map((post: any) => postToArticle(post));
  const latestArticle = authorArticles[0];

  return (
    <PageWrapper>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-hero-pattern opacity-80" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <Link href="/opinions" className="mb-8 inline-flex items-center gap-2 text-sm font-cairo text-ivory/80 transition-colors hover:text-gold">
            <ArrowRight size={16} />
            العودة إلى أقلام الناس
          </Link>
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
            <div className="flex justify-center lg:justify-start">
              {author.avatarUrl ? (
                <Image src={author.avatarUrl} alt={author.name} width={220} height={220} priority className="h-44 w-44 rounded-[2rem] object-cover shadow-gold ring-4 ring-gold/30 md:h-56 md:w-56" />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center rounded-[2rem] bg-white/10 text-gold ring-4 ring-gold/20 md:h-56 md:w-56" aria-hidden="true">
                  <UserRound size={76} />
                </div>
              )}
            </div>
            <div className="text-center lg:text-right">
              <h1 className="mb-5 font-cairo text-3xl font-bold leading-tight md:text-5xl">{author.name}</h1>
              {author.bio ? <p className="max-w-3xl font-tajawal text-base leading-[2] text-ivory/85 md:text-lg">{author.bio}</p> : null}
              <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-3 md:grid-cols-3 lg:mx-0">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <BookOpen className="mx-auto mb-2 text-gold lg:mx-0" size={20} />
                  <div className="font-cairo text-xl font-bold">{authorArticles.length}</div>
                  <div className="font-tajawal text-xs text-ivory/70">مقال منشور</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <PenLine className="mx-auto mb-2 text-gold lg:mx-0" size={20} />
                  <div className="font-cairo text-xl font-bold">قلم</div>
                  <div className="font-tajawal text-xs text-ivory/70">مساهمات فكرية وثقافية</div>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 p-4 md:col-span-1">
                  <Calendar className="mx-auto mb-2 text-gold lg:mx-0" size={20} />
                  <div className="font-cairo text-sm font-bold">{latestArticle ? formatDateArabic(latestArticle.publishedAt) : "قريبًا"}</div>
                  <div className="font-tajawal text-xs text-ivory/70">آخر مساهمة</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-ivory py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="section-title">مقالات الكاتب</h2>
              <p className="section-subtitle mt-2">أرشيف المقالات والقصص المنشورة باسم {author.name}.</p>
            </div>
            <Link href="/write" className="btn-outline-gold w-fit"><Mail size={17} />اكتب معنا</Link>
          </div>
          {authorArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{authorArticles.map((article: any) => <ArticleCard key={article.id} article={article} />)}</div>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-card"><p className="font-tajawal text-text-muted">لا توجد مقالات منشورة لهذا الكاتب بعد.</p></div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
