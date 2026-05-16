import type { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://madaalinsan.vercel.app";
export const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "مدى الإنسان";

export function buildMetadata(input: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}): Metadata {
  const url = new URL(input.path || "/", siteUrl).toString();
  const title = input.title.includes(siteName) ? input.title : `${input.title} | ${siteName}`;
  const description = input.description || "منصة إنسانية - اجتماعية - ثقافية - علمية - متنوعة تنقل قصص الناس وقضاياهم بكرامة ووضوح.";
  return {
    title,
    description,
    keywords: input.keywords,
    alternates: { canonical: input.canonical || url },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: { title: input.ogTitle || title, description: input.ogDescription || description, url, type: "article", locale: "ar_SA", images: input.image ? [{ url: input.image }] : undefined },
    twitter: { card: "summary_large_image", title: input.twitterTitle || title, description: input.twitterDescription || description, images: input.image ? [input.image] : undefined },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    description: "منصة إنسانية - اجتماعية - ثقافية - علمية - متنوعة",
  };
}

export function articleJsonLd(input: { title: string; description?: string; url: string; image?: string; author?: string; datePublished?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: input.url,
    image: input.image,
    author: input.author ? { "@type": "Person", name: input.author } : undefined,
    datePublished: input.datePublished,
    publisher: { "@type": "Organization", name: siteName },
  };
}


export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
