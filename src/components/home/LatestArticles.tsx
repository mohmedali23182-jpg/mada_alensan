import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ArticleCard from "@/components/ui/ArticleCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { getPublishedArticles } from "@/lib/content";

export default async function LatestArticles() {
  const articles = await getPublishedArticles(6);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader title="أحدث المنشورات" subtitle="قصص وأخبار وأقلام جديدة من قاعدة بيانات المنصة" action={<Link href="/news" className="inline-flex items-center gap-1.5 text-gold font-semibold font-cairo text-sm hover:text-gold-dark transition-colors">عرض الكل<ArrowLeft size={15} /></Link>} />
        {articles.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{articles.map((article: any) => <ArticleCard key={article.id} article={article} />)}</div> : <div className="text-center py-12 bg-ivory/30 rounded-2xl border border-dashed border-gold/20"><p className="text-navy/60 font-cairo text-lg">لا توجد مقالات منشورة حالياً</p></div>}
      </div>
    </section>
  );
}
