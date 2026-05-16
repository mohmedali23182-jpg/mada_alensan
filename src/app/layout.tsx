import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mada-alensan.vercel.app"),
  title: {
    default: "مدى الإنسان | منصة إنسانية - اجتماعية - ثقافية - علمية - متنوعة",
    template: "%s | مدى الإنسان",
  },
  description:
    "مدى الإنسان منصة إنسانية، اجتماعية، ثقافية، علمية، ومتنوعة. لا تكتفي بنقل القضايا أو الأحداث، بل تقدم محتوى يحمل تنوعًا معرفيًا ورسالة سامية تخدم الإنسان والمجتمع.",
  keywords: ["مدى الإنسان", "أخبار إنسانية", "قصص الناس", "منصة عربية", "إنسانية", "فقر", "نزوح", "تعليم"],
  openGraph: {
    title: "مدى الإنسان | منصة إنسانية - اجتماعية - ثقافية - علمية - متنوعة",
    description: "إنسانية - اجتماعية - ثقافية - علمية - متنوعة",
    locale: "ar_YE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "مدى الإنسان | منصة إنسانية - اجتماعية - ثقافية - علمية - متنوعة",
    description: "إنسانية - اجتماعية - ثقافية - علمية - متنوعة",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-tajawal antialiased">
        {children}
      </body>
    </html>
  );
}
