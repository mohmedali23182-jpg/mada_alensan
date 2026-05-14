import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  className?: string;
}

export default function PageHero({ title, subtitle, badge, badgeColor, className }: PageHeroProps) {
  return (
    <section className={cn("bg-navy text-white py-16 md:py-20 relative overflow-hidden", className)}>
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 bg-hero-pattern opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 text-center">
        {badge && (
          <div
            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold font-cairo mb-4 border"
            style={
              badgeColor
                ? {
                    backgroundColor: `${badgeColor}18`,
                    color: badgeColor,
                    borderColor: `${badgeColor}40`,
                  }
                : {
                    backgroundColor: "rgba(201,154,62,0.15)",
                    color: "#C99A3E",
                    borderColor: "rgba(201,154,62,0.3)",
                  }
            }
          >
            {badge}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-cairo mb-4 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-ivory/70 text-base md:text-lg font-tajawal leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
