import PageWrapper from "@/components/layout/PageWrapper";
import PageHero from "@/components/ui/PageHero";
import ArticleCard from "@/components/ui/ArticleCard";
import WriteWithUsBanner from "@/components/ui/WriteWithUsBanner";
import { getArticlesByUiCategory } from "@/lib/content";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "الأخبار الإنسانية", description: "أحدث الأخبار والتقارير الإنسانية من مختلف المناطق والمجتمعات." };

export default async function NewsPage() {
  const articles = await getArticlesByUiCategory("news", 30);
  return <PageWrapper><PageHero badge="الأخبار الإنسانية" badgeColor="#B84C4C" title="الأخبار الإنسانية" subtitle="تقارير وأخبار موثقة عن أوضاع الناس في مختلف المناطق" /><section className="py-16 md:py-20 bg-ivory"><div className="max-w-7xl mx-auto px-4 md:px-6">{articles.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">{articles.map((a: any) => <ArticleCard key={a.id} article={a} />)}</div> : <Empty /> }<div className="max-w-2xl mx-auto"><WriteWithUsBanner /></div></div></section></PageWrapper>;
}
function Empty(){return <div className="mb-14 rounded-2xl bg-white p-8 text-center font-bold text-navy/60">لا توجد أخبار منشورة حالياً.</div>}
