import { ArrowUpLeft, MoreHorizontal } from "lucide-react";

export function StatCard({ title, value, note }: { title: string; value: string | number; note?: string }) {
  return (
    <div className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-navy/60">{title}</p>
        <MoreHorizontal className="h-5 w-5 text-navy/30" />
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <strong className="font-kufi text-3xl text-navy">{value}</strong>
        {note ? <span className="flex items-center gap-1 rounded-full bg-hope/10 px-3 py-1 text-xs font-bold text-hope"><ArrowUpLeft className="h-3 w-3" />{note}</span> : null}
      </div>
    </div>
  );
}

export function AdminSection({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-kufi text-xl font-black text-navy">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-7 text-navy/60">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminButton({ children }: { children: React.ReactNode }) {
  return <button className="rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy-light">{children}</button>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "bg-navy/10 text-navy",
    success: "bg-hope/10 text-hope",
    warning: "bg-gold/15 text-gold-dark",
    danger: "bg-urgent/10 text-urgent",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
