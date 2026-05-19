import type { Metadata } from "next";
import { Cairo, Noto_Kufi_Arabic, Tajawal } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const kufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-kufi",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://madaalinsan.vercel.app"),
  title: {
    default: "مدى الإنسان | منصة إنسانية، اجتماعية، ثقافية، علمية، ومتنوعة",
    template: "%s | مدى الإنسان",
  },
  description:
    "مدى الإنسان منصة إنسانية مستقلة تنقل قصص الناس، مقالاتهم، رسائلهم، وقضاياهم بكرامة ووضوح، حتى يصل الصوت إلى من يهمه الأمر.",
  keywords: ["مدى الإنسان", "أخبار إنسانية", "قصص الناس", "منصة عربية", "إنسانية", "فقر", "نزوح", "تعليم"],
  openGraph: {
    title: "مدى الإنسان | منصة إنسانية، اجتماعية، ثقافية، علمية، ومتنوعة",
    description: "نمدّ صوت الإنسان… حتى لا تبقى القصة وحيدة",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "مدى الإنسان | منصة إنسانية، اجتماعية، ثقافية، علمية، ومتنوعة",
    description: "نمدّ صوت الإنسان… حتى لا تبقى القصة وحيدة",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable} ${kufi.variable}`}>
      <body className="font-tajawal antialiased">
        {children}
      </body>
    </html>
  );
}
