import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "hope" | "urgent" | "teal" | "navy" | "default";
  className?: string;
}

const variants = {
  gold: "bg-gold/10 text-[#A87E2E] border border-gold/30",
  hope: "bg-hope/10 text-hope-dark border border-hope/30",
  urgent: "bg-urgent/10 text-urgent border border-urgent/30",
  teal: "bg-teal/10 text-teal border border-teal/30",
  navy: "bg-navy/10 text-navy border border-navy/20",
  default: "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-cairo",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
