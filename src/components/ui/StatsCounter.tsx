"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, AlertTriangle, PenLine, MapPin } from "lucide-react";
import type { Stats } from "@/lib/types";

interface StatItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  suffix?: string;
}

function StatItem({ icon: Icon, value, label, color, suffix = "+" }: StatItemProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const steps = 50;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, value);
      setCount(Math.round(current));
      if (current >= value) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, value]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center gap-3">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={26} style={{ color }} />
      </div>
      <div>
        <div
          className="text-3xl md:text-4xl font-bold font-kufi"
          style={{ color }}
        >
          {count.toLocaleString("ar-SA")}
          <span className="text-2xl">{suffix}</span>
        </div>
        <div className="text-text-light text-sm font-tajawal mt-1">{label}</div>
      </div>
    </div>
  );
}

interface StatsCounterProps {
  stats: Stats;
}

export default function StatsCounter({ stats }: StatsCounterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <StatItem icon={BookOpen} value={stats.stories} label="قصة منشورة" color="#2F8F6B" />
      <StatItem icon={AlertTriangle} value={stats.cases} label="قضية موثقة" color="#B84C4C" />
      <StatItem icon={PenLine} value={stats.articles} label="مقال مشارك" color="#C99A3E" />
      <StatItem icon={MapPin} value={stats.regions} label="منطقة مغطاة" color="#0F766E" />
    </div>
  );
}
