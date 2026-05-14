import PageWrapper from "@/components/layout/PageWrapper";
import PageHero from "@/components/ui/PageHero";
import ArticleCard from "@/components/ui/ArticleCard";
import WriteWithUsBanner from "@/components/ui/WriteWithUsBanner";
import { getArticlesByUiCategory } from "@/lib/content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "قصة وكفاح", description: "قصص حقيقية عن أناس تحدّوا الصعاب وصنعوا مستقبلهم بإرادتهم" };

export default async function Page() {
  const articles = await getArticlesByUiCategory("stories", 30);
  return <PageWrapper><PageHero badge="قصة وكفاح" badgeColor="#C99A3E" title="قصة وكفاح" subtitle="قصص حقيقية عن أناس تحدّوا الصعاب وصنعوا مستقبلهم بإرادتهم" /><section className="py-16 md:py-20 bg-ivory"><div className="max-w-7xl mx-auto px-4 md:px-6">{articles.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">{articles.map((a: any) => <ArticleCard key={a.id} article={a} />)}</div> : <div className="mb-14 rounded-2xl bg-white p-8 text-center font-bold text-navy/60">لا توجد قصص منشورة حالياً.</div>}<div className="max-w-2xl mx-auto"><WriteWithUsBanner /></div></div></section></PageWrapper>;
}
