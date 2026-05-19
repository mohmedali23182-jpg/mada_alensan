import { prisma } from "@/lib/prisma";
import { stripHtml } from "@/lib/rich-content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://madaalinsan.vercel.app").replace(/\/$/, "");
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "مدى الإنسان";

function xmlEscape(value = "") {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: { title: true, slug: true, excerpt: true, content: true, updatedAt: true, publishedAt: true, coverImage: true, contributor: { select: { name: true } }, category: { select: { name: true } } },
  });

  const items = posts.map((post: any) => {
    const url = `${SITE_URL}/articles/${post.slug}`;
    const description = xmlEscape(post.excerpt || stripHtml(post.content).slice(0, 240));
    const enclosure = post.coverImage ? `<enclosure url="${xmlEscape(post.coverImage)}" type="image/jpeg" />` : "";
    return `<item>
<title>${xmlEscape(post.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<description>${description}</description>
<pubDate>${(post.publishedAt || post.updatedAt).toUTCString()}</pubDate>
${post.category?.name ? `<category>${xmlEscape(post.category.name)}</category>` : ""}
${post.contributor?.name ? `<author>${xmlEscape(post.contributor.name)}</author>` : ""}
${enclosure}
</item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${xmlEscape(SITE_NAME)}</title>
<link>${SITE_URL}</link>
<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
<description>${xmlEscape("آخر مقالات وقصص منصة مدى الإنسان")}</description>
<language>ar</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "s-maxage=300, stale-while-revalidate=86400" } });
}
