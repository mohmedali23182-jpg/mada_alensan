import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Calendar, ArrowRight, AlertTriangle, CheckCircle2, Loader2, Search } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Badge from "@/components/ui/Badge";
import ShareButtons from "@/components/ui/ShareButtons";
import { getCaseBySlugFromDb, getPublishedCases } from "@/lib/content";
import { getCaseStatusLabel, getCaseStatusColor, getCaseTypeLabel, getUrgencyLabel, getUrgencyColor, formatDateArabic, buildMetadata } from "@/lib/utils";
import type { Metadata } from "next";
import type { CaseStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const caseItem = await getCaseBySlugFromDb(params.slug);
  if (!caseItem) return {};
  return buildMetadata({ title: caseItem.seo?.title || caseItem.title, description: caseItem.seo?.description || caseItem.description, image: caseItem.coverImage, keywords: [caseItem.region, getCaseTypeLabel(caseItem.type)] });
}

const timelineIconMap: Record<CaseStatus | "default", React.ElementType> = { urgent: AlertTriangle, "under-review": Search, "in-progress": Loader2, resolved: CheckCircle2, default: Clock };
const timelineColorMap: Record<CaseStatus | "default", string> = { urgent: "text-urgent bg-urgent/10 border-urgent/30", "under-review": "text-gold bg-gold/10 border-gold/30", "in-progress": "text-teal bg-teal/10 border-teal/30", resolved: "text-hope bg-hope/10 border-hope/30", default: "text-text bg-gray-100 border-gray-200" };

export default async function CaseDetailPage({ params }: Props) {
  const caseItem = await getCaseBySlugFromDb(params.slug);
  if (!caseItem) notFound();
  const statusBadge = getCaseStatusColor(caseItem.status).replace("badge-", "") as "gold" | "hope" | "urgent" | "teal" | "navy";
  const urgencyBadge = getUrgencyColor(caseItem.urgencyLevel).replace("badge-", "") as "gold" | "hope" | "urgent" | "teal" | "navy";
  const otherCases = (await getPublishedCases(6)).filter((c: any) => c.slug !== caseItem.slug && c.status !== "resolved").slice(0, 3);
  return (
    <PageWrapper>
      <div className="relative bg-navy py-16 md:py-20 overflow-hidden"><div className="absolute inset-0 opacity-20">{caseItem.coverImage && <Image src={caseItem.coverImage} alt="" fill className="object-cover" />}<div className="absolute inset-0 bg-navy/80" /></div><div className="relative max-w-4xl mx-auto px-4 md:px-6"><Link href="/issues" className="inline-flex items-center gap-2 text-ivory/60 hover:text-gold text-sm font-cairo mb-8 transition-colors"><ArrowRight size={15} />العودة إلى القضايا</Link><div className="flex flex-wrap gap-2 mb-5"><Badge variant={statusBadge}>{getCaseStatusLabel(caseItem.status)}</Badge><Badge variant={urgencyBadge}>عاجلية {getUrgencyLabel(caseItem.urgencyLevel)}</Badge><Badge variant="navy">{getCaseTypeLabel(caseItem.type)}</Badge></div><h1 className="text-2xl md:text-4xl font-bold font-cairo text-white leading-relaxed mb-6">{caseItem.title}</h1><div className="flex flex-wrap items-center gap-5 text-ivory/60 text-sm font-tajawal"><span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold" />{caseItem.region}</span><span className="flex items-center gap-1.5"><Calendar size={14} />نُشرت: {formatDateArabic(caseItem.publishedAt)}</span><span className="flex items-center gap-1.5"><Clock size={14} />آخر تحديث: {formatDateArabic(caseItem.lastUpdated)}</span></div></div></div>
      <section className="bg-ivory py-14 md:py-18"><div className="max-w-4xl mx-auto px-4 md:px-6"><div className="grid grid-cols-1 lg:grid-cols-3 gap-10"><div className="lg:col-span-2 space-y-8"><div className="bg-white rounded-2xl shadow-card p-7"><h2 className="text-lg font-bold font-cairo text-navy mb-5 pb-3 border-b border-ivory-dark">تفاصيل القضية</h2><div className="space-y-4">{(caseItem.fullDescription ?? caseItem.description).split("\n\n").map((para, i) => <p key={i} className="text-text font-tajawal leading-[2] text-base">{para}</p>)}</div></div>{caseItem.timeline?.length ? <div className="bg-white rounded-2xl shadow-card p-7"><h2 className="text-lg font-bold font-cairo text-navy mb-6 pb-3 border-b border-ivory-dark">الخط الزمني</h2><div className="relative"><div className="absolute top-0 bottom-0 right-6 w-0.5 bg-ivory-dark" /><div className="space-y-6">{caseItem.timeline.map((event) => { const statusKey = (event.status ?? "default") as CaseStatus | "default"; const Icon = timelineIconMap[statusKey] ?? Clock; return <div key={event.id} className="flex gap-5 relative"><div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shrink-0 z-10 ${timelineColorMap[statusKey]}`}><Icon size={18} /></div><div className="flex-1 pb-2 border-b border-ivory-dark"><div className="flex items-center justify-between gap-2 mb-1.5"><h3 className="font-bold font-cairo text-navy text-sm">{event.title}</h3><span className="text-xs text-text-muted font-tajawal shrink-0">{formatDateArabic(event.date)}</span></div><p className="text-text-light text-sm font-tajawal leading-relaxed">{event.description}</p></div></div>; })}</div></div></div> : null}<div className="bg-white rounded-2xl shadow-card p-5"><ShareButtons title={caseItem.title} /></div></div><aside className="space-y-5"><div className="bg-white rounded-2xl shadow-card p-5 space-y-4"><h3 className="font-bold font-cairo text-navy text-sm pb-2 border-b border-ivory-dark">ملخص القضية</h3>{[{ label: "المنطقة", value: caseItem.region },{ label: "النوع", value: getCaseTypeLabel(caseItem.type) },{ label: "الحالة", value: getCaseStatusLabel(caseItem.status) },{ label: "مستوى العاجلية", value: getUrgencyLabel(caseItem.urgencyLevel) }].map((item: any) => <div key={item.label} className="flex justify-between text-sm"><span className="font-semibold font-cairo text-text">{item.label}</span><span className="font-tajawal text-text-muted">{item.value}</span></div>)}</div><div className="bg-navy rounded-2xl p-5 text-center"><AlertTriangle size={22} className="text-urgent mx-auto mb-3" /><h3 className="text-white font-bold font-cairo text-sm mb-2">هل لديك حالة مشابهة؟</h3><p className="text-ivory/60 text-xs font-tajawal mb-4 leading-relaxed">أرسل بلاغك وسنتولى المتابعة</p><Link href="/report" className="block w-full bg-urgent hover:bg-urgent-dark text-white font-bold font-cairo text-sm px-4 py-2.5 rounded-xl transition-colors text-center">بلّغ الآن</Link></div></aside></div>{otherCases.length > 0 && <div className="mt-14 pt-10 border-t border-ivory-dark"><h2 className="text-xl font-bold font-cairo text-navy mb-6">قضايا تحتاج متابعتك</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{otherCases.map((c: any) => <Link key={c.id} href={`/issues/${c.slug}`} className="group block"><div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-5 border-r-4 border-gold"><h3 className="font-bold font-cairo text-navy text-sm leading-relaxed group-hover:text-gold transition-colors mb-2">{c.title}</h3><span className="flex items-center gap-1.5 text-xs text-text-muted font-tajawal"><MapPin size={11} className="text-gold" />{c.region}</span></div></Link>)}</div></div>}</div></section>
    </PageWrapper>
  );
}
