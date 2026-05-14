"use client";

import { useState } from "react";
import { Link2, Check, Globe, Send, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const pageUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const encoded = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const links = [
    {
      label: "فيسبوك",
      href: `https://facebook.com/sharer/sharer.php?u=${encoded}`,
      icon: Globe,
      color: "hover:bg-blue-50 hover:text-blue-600",
    },
    {
      label: "تويتر",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
      icon: Globe,
      color: "hover:bg-gray-100 hover:text-gray-900",
    },
    {
      label: "واتساب",
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      icon: MessageCircle,
      color: "hover:bg-green-50 hover:text-green-600",
    },
    {
      label: "تليجرام",
      href: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
      icon: Send,
      color: "hover:bg-blue-50 hover:text-blue-500",
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-semibold font-cairo text-text">شارك:</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-9 h-9 rounded-xl bg-ivory flex items-center justify-center transition-all duration-200 ${link.color}`}
          title={link.label}
        >
          <link.icon size={15} />
        </a>
      ))}
      <button
        onClick={handleCopy}
        className="w-9 h-9 rounded-xl bg-ivory flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-all duration-200"
        title="نسخ الرابط"
      >
        {copied ? <Check size={15} className="text-hope" /> : <Link2 size={15} />}
      </button>
    </div>
  );
}
