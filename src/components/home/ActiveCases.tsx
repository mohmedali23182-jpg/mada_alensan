import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CaseCard from "@/components/ui/CaseCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { getPublishedCases } from "@/lib/content";

export default async function ActiveCases() {
  const activeCases = (await getPublishedCases(3)).filter((c: any) => c.status !== "resolved");

  return (
    <section className="py-16 md:py-20 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader title="قضايا قيد المتابعة" subtitle="قضايا إنسانية موثقة تحتاج إلى اهتمامك ومتابعتك" action={<Link href="/issues" className="inline-flex items-center gap-1.5 text-gold font-semibold font-cairo text-sm hover:text-gold-dark transition-colors">كل القضايا<ArrowLeft size={15} /></Link>} />
        {activeCases.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{activeCases.map((c: any) => <CaseCard key={c.id} caseItem={c} />)}</div> : <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-gold/20"><p className="text-navy/60 font-cairo text-lg">لا توجد قضايا منشورة حالياً</p></div>}
      </div>
    </section>
  );
}
