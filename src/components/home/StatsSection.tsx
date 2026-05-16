import StatsCounter from "@/components/ui/StatsCounter";
import { getStatsFromDb } from "@/lib/content";

export default async function StatsSection() {
  const stats = await getStatsFromDb();
  return (
    <section className="py-16 md:py-20 bg-navy relative overflow-hidden"><div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" /><div className="absolute bottom-0 left-0 w-60 h-60 bg-hope/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" /><div className="relative max-w-7xl mx-auto px-4 md:px-6"><div className="text-center mb-12"><h2 className="text-2xl md:text-3xl font-bold font-cairo text-white mb-3">مدى الإنسان بالأرقام</h2><div className="w-14 h-1 rounded-full bg-gold mx-auto mb-3" /><p className="text-ivory/60 text-sm font-tajawal">أثر حقيقي، قصص موثقة، وأصوات وصلت</p></div><StatsCounter stats={stats} /></div></section>
  );
}
