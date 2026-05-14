import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://madaalinsan.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/news", "/life", "/stories", "/letters", "/issues", "/opinions", "/send-story", "/write", "/report", "/about", "/contact"].map((route) => ({ url: `${SITE_URL}${route}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.8 }));
  const [articles, cases, authors] = await Promise.all([
    prisma.post.findMany({ where: { status: "PUBLISHED", deletedAt: null, visibility: "PUBLIC" }, select: { slug: true, updatedAt: true, publishedAt: true } }).catch(() => []),
    prisma.case.findMany({ where: { status: { in: ["PUBLISHED", "CONTACTED", "IN_PROGRESS", "RESOLVED", "VERIFIED"] } }, select: { slug: true, updatedAt: true, publishedAt: true, lastUpdated: true } }).catch(() => []),
    prisma.contributor.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }).catch(() => []),
  ]);
  return [
    ...staticRoutes,
    ...articles.map((article: any) => ({ url: `${SITE_URL}/articles/${article.slug}`, lastModified: article.updatedAt || article.publishedAt || new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...cases.map((item: any) => ({ url: `${SITE_URL}/issues/${item.slug}`, lastModified: item.lastUpdated || item.updatedAt || new Date(), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...authors.map((author: any) => ({ url: `${SITE_URL}/authors/${author.slug}`, lastModified: author.updatedAt || new Date(), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
