import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
  action?: React.ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  centered = false,
  light = false,
  className,
  action,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 md:mb-12",
        centered ? "text-center" : "flex items-end justify-between gap-4",
        className
      )}
    >
      <div className={centered ? "" : ""}>
        <h2
          className={cn(
            "text-2xl md:text-3xl font-bold font-cairo mb-3",
            light ? "text-ivory" : "text-navy"
          )}
        >
          {title}
        </h2>
        <div className={cn("w-14 h-1 rounded-full bg-gold mb-3", centered ? "mx-auto" : "")} />
        {subtitle && (
          <p
            className={cn(
              "text-base font-tajawal",
              light ? "text-ivory/70" : "text-text-light"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && !centered && <div className="shrink-0">{action}</div>}
    </div>
  );
}
