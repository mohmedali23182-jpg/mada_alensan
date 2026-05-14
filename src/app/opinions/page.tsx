import PageWrapper from "@/components/layout/PageWrapper";
import PageHero from "@/components/ui/PageHero";
import ArticleCard from "@/components/ui/ArticleCard";
import WriteWithUsBanner from "@/components/ui/WriteWithUsBanner";
import { getArticlesByUiCategory } from "@/lib/content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "أقلام الناس", description: "مقالات من أبناء المجتمع تلامس الواقع وتعبّر عن الحياة كما هي" };

export default async function Page() {
  const articles = await getArticlesByUiCategory("opinions", 30);
  return <PageWrapper><PageHero badge="أقلام الناس" badgeColor="#C99A3E" title="أقلام الناس" subtitle="مقالات من أبناء المجتمع تلامس الواقع وتعبّر عن الحياة كما هي" /><section className="py-16 md:py-20 bg-ivory"><div className="max-w-7xl mx-auto px-4 md:px-6">{articles.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">{articles.map((a: any) => <ArticleCard key={a.id} article={a} />)}</div> : <div className="mb-14 rounded-2xl bg-white p-8 text-center font-bold text-navy/60">لا توجد مقالات مشاركة حالياً.</div>}<div className="max-w-2xl mx-auto"><WriteWithUsBanner /></div></div></section></PageWrapper>;
}
