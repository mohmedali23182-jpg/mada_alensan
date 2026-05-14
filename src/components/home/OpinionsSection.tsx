import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowLeft } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import { getArticlesByUiCategory } from "@/lib/content";
import { formatReadingTime } from "@/lib/utils";

export default async function OpinionsSection() {
  const opinions = await getArticlesByUiCategory("opinions", 4);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader title="أقلام الناس" subtitle="مقالات من قلب المجتمع، بأقلام أبنائه" action={<Link href="/opinions" className="inline-flex items-center gap-1.5 text-gold font-semibold font-cairo text-sm hover:text-gold-dark transition-colors">كل المقالات<ArrowLeft size={15} /></Link>} />
        {opinions.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{opinions.map((article: any) => <Link key={article.id} href={`/articles/${article.slug}`} className="group block"><div className="bg-ivory rounded-2xl p-5 flex gap-4 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"><div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden"><Image src={article.coverImage} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" /></div><div className="flex-1 min-w-0"><Badge variant="gold" className="mb-2 text-[10px]">قلم مشارك</Badge><h3 className="font-bold font-cairo text-navy text-sm leading-relaxed line-clamp-2 group-hover:text-gold transition-colors mb-2">{article.title}</h3><div className="flex items-center justify-between"><span className="text-xs text-text-muted font-tajawal">{article.author.name}</span><span className="flex items-center gap-1 text-xs text-text-muted font-tajawal"><Clock size={11} />{formatReadingTime(article.readingTime)}</span></div></div></div></Link>)}</div> : <div className="rounded-2xl bg-ivory p-8 text-center text-navy/60 font-bold">لا توجد مقالات مشاركة حالياً.</div>}
      </div>
    </section>
  );
}
