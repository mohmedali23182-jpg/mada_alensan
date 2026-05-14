import Link from "next/link";
import { MapPin, ArrowLeft, Clock } from "lucide-react";
import Badge from "./Badge";
import {
  getCaseStatusLabel,
  getCaseStatusColor,
  getCaseTypeLabel,
  getUrgencyLabel,
  getUrgencyColor,
  formatDateArabic,
} from "@/lib/utils";
import type { Case } from "@/lib/types";

interface CaseCardProps {
  caseItem: Case;
}

export default function CaseCard({ caseItem }: CaseCardProps) {
  const statusBadge = getCaseStatusColor(caseItem.status).replace("badge-", "") as
    | "gold"
    | "hope"
    | "urgent"
    | "teal"
    | "navy";
  const urgencyBadge = getUrgencyColor(caseItem.urgencyLevel).replace("badge-", "") as
    | "gold"
    | "hope"
    | "urgent"
    | "teal"
    | "navy";

  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-5 flex flex-col gap-4 border-r-4 border-r-gold">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold font-cairo text-navy text-base leading-relaxed flex-1">
          {caseItem.title}
        </h3>
        <Badge variant={statusBadge} className="shrink-0 text-[11px]">
          {getCaseStatusLabel(caseItem.status)}
        </Badge>
      </div>

      <p className="text-text-light text-sm font-tajawal leading-relaxed line-clamp-2">
        {caseItem.description}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-xs text-text-muted font-tajawal">
          <MapPin size={12} className="text-gold" />
          {caseItem.region}
        </span>
        <Badge variant="navy" className="text-[10px]">
          {getCaseTypeLabel(caseItem.type)}
        </Badge>
        <Badge variant={urgencyBadge} className="text-[10px]">
          عاجلية: {getUrgencyLabel(caseItem.urgencyLevel)}
        </Badge>
      </div>

      <div className="flex items-center justify-between border-t border-ivory-dark pt-3">
        <span className="flex items-center gap-1 text-xs text-text-muted font-tajawal">
          <Clock size={12} />
          آخر تحديث: {formatDateArabic(caseItem.lastUpdated)}
        </span>
        <Link
          href={`/issues/${caseItem.slug}`}
          className="flex items-center gap-1 text-gold text-xs font-semibold font-cairo hover:text-gold-dark transition-colors"
        >
          تابع القضية
          <ArrowLeft size={12} />
        </Link>
      </div>
    </div>
  );
}
