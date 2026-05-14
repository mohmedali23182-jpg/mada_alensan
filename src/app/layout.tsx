import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://madaalinsan.vercel.app"),
  title: {
    default: "مدى الناس | منصة إنسانية عربية مستقلة",
    template: "%s | مدى الناس",
  },
  description:
    "مدى الناس منصة إنسانية مستقلة تنقل قصص الناس، مقالاتهم، رسائلهم، وقضاياهم بكرامة ووضوح، حتى يصل الصوت إلى من يهمه الأمر.",
  keywords: ["مدى الناس", "أخبار إنسانية", "قصص الناس", "منصة عربية", "إنسانية", "فقر", "نزوح", "تعليم"],
  openGraph: {
    title: "مدى الناس | منصة إنسانية عربية مستقلة",
    description: "نمدّ صوت الإنسان… حتى لا تبقى القصة وحيدة",
    locale: "ar_YE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "مدى الناس | منصة إنسانية عربية مستقلة",
    description: "نمدّ صوت الإنسان… حتى لا تبقى القصة وحيدة",
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
