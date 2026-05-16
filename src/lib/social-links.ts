// ============================================
// روابط التواصل الاجتماعي - مدى الإنسان
// مكوّن مرن قابل للإدارة من لوحة التحكم
// ============================================

export interface SocialPlatform {
  id: string;
  name: string;
  label: string;
  url?: string;
  color: string;
  bgColor: string;
  icon: string; // Lucide icon name
}

export const SOCIAL_LINKS: SocialPlatform[] = [
  {
    id: "facebook",
    name: "facebook",
    label: "فيسبوك",
    url: "https://facebook.com/madaalinsan",
    color: "#1877F2",
    bgColor: "#E7F3FF",
    icon: "Facebook",
  },
  {
    id: "instagram",
    name: "instagram",
    label: "إنستغرام",
    url: "https://instagram.com/madaalinsan",
    color: "#E1306C",
    bgColor: "#FDEEF4",
    icon: "Instagram",
  },
  {
    id: "whatsapp",
    name: "whatsapp",
    label: "واتساب",
    url: "https://wa.me/967xxxxxxxxx",
    color: "#25D366",
    bgColor: "#E8FFF2",
    icon: "MessageCircle",
  },
  {
    id: "twitter",
    name: "twitter",
    label: "X (تويتر)",
    url: "https://x.com/madaalinsan",
    color: "#000000",
    bgColor: "#F0F0F0",
    icon: "Twitter",
  },
  {
    id: "telegram",
    name: "telegram",
    label: "تليجرام",
    url: "https://t.me/madaalinsan",
    color: "#2AABEE",
    bgColor: "#E6F4FD",
    icon: "Send",
  },
  {
    id: "youtube",
    name: "youtube",
    label: "يوتيوب",
    url: "https://youtube.com/@madaalinsan",
    color: "#FF0000",
    bgColor: "#FFEEEE",
    icon: "Youtube",
  },
  {
    id: "email",
    name: "email",
    label: "البريد الإلكتروني",
    url: "mailto:mtzallqmy@gmail.com",
    color: "#C99A3E",
    bgColor: "#FDF6E8",
    icon: "Mail",
  },
];

export function getSocialLink(id: string): SocialPlatform | undefined {
  return SOCIAL_LINKS.find((s) => s.id === id);
}
