import "server-only";
import { prisma } from "@/lib/prisma";
import type { Article, Case, Author, ArticleCategory, CaseStatus as UiCaseStatus, CaseType as UiCaseType } from "@/lib/types";

export const dynamic = "force-dynamic";

const fallbackImage = "/images/placeholder-cover.svg";
const fallbackAvatar = "";

function logContentError(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[content:${scope}]`, message);
}

async function safeQuery<T>(scope: string, query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    logContentError(scope, error);
    return fallback;
  }
}


type PostWithRelations = {
  id: string; title: string; slug: string; excerpt: string | null; content: string; coverImage: string | null; thumbnail: string | null; quote: string | null; type: string; status: string; featured: boolean; isStoryOfDay: boolean; readingTime: number; viewsCount: number; publishedAt: Date | null; createdAt: Date; updatedAt: Date; seoTitle: string | null; seoDescription: string | null; seoKeywords: string[]; ogTitle?: string | null; ogDescription?: string | null; ogImage?: string | null; twitterTitle?: string | null; twitterDescription?: string | null; twitterImage?: string | null; canonicalUrl: string | null; city: string | null; country: string | null; latitude: number | null; longitude: number | null;
  category: { id: string; name: string; slug: string } | null;
  contributor: { id: string; name: string; slug: string; bio: string | null; avatarUrl: string | null; facebookUrl: string | null; instagramUrl: string | null; xUrl: string | null; whatsappUrl: string | null; telegramUrl: string | null; youtubeUrl: string | null; websiteUrl: string | null } | null;
  author: { id: string; name: string; email: string; avatarUrl: string | null; role: string } | null;
  tags: Array<{ tag: { name: string; slug: string } }>;
};
type CaseWithRelations = {
  id: string; title: string; slug: string; type: string; description: string; fullDescription: string | null; urgencyLevel: number; status: string; coverImage: string | null; lastUpdated: Date; publishedAt: Date | null; createdAt: Date; seoTitle: string | null; seoDescription: string | null; latitude: number | null; longitude: number | null;
  region: { name: string; country: string; countryCode: string | null; latitude: number | null; longitude: number | null } | null;
  updates: Array<{ id: string; title: string; body: string; status: string | null; createdAt: Date }>;
};

export function toUiCategory(post: Pick<PostWithRelations, "type" | "category">): ArticleCategory {
  const slug = post.category?.slug;
  if (slug === "life" || slug === "peoples-life") return "life";
  if (slug === "stories" || slug === "struggle-story") return "stories";
  if (slug === "letters" || slug === "human-message") return "letters";
  if (slug === "issues" || slug === "issues-files") return "issues";
  if (slug === "opinions" || slug === "peoples-pens") return "opinions";
  if (post.type === "STORY") return "stories";
  if (post.type === "HUMAN_MESSAGE") return "letters";
  if (post.type === "CASE_FILE") return "issues";
  if (post.type === "CONTRIBUTOR_ARTICLE") return "opinions";
  return "news";
}

function authorFromPost(post: PostWithRelations): Author {
  const contributor = post.contributor;
  const user = post.author;
  return {
    id: contributor?.id || user?.id || "editorial-team",
    slug: contributor?.slug || undefined,
    name: contributor?.name || user?.name || "هيئة التحرير",
    avatar: contributor?.avatarUrl || user?.avatarUrl || fallbackAvatar || undefined,
    bio: contributor?.bio || "كاتب في منصة إنسانية - اجتماعية - ثقافية - علمية - متنوعة.",
    role: contributor?.bio ? undefined : user?.role ? "فريق التحرير" : undefined,
  };
}

export function postToArticle(post: PostWithRelations): Article {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: post.excerpt || post.seoDescription || "",
    content: post.content,
    coverImage: post.coverImage || post.thumbnail || fallbackImage,
    thumbnail: post.thumbnail || post.coverImage || fallbackImage,
    category: toUiCategory(post),
    author: authorFromPost(post),
    publishedAt: (post.publishedAt || post.createdAt).toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    readingTime: post.readingTime || Math.max(1, Math.ceil(post.content.split(/\s+/).length / 220)),
    featured: post.featured,
    quote: post.quote || undefined,
    tags: post.tags.map((item) => item.tag.name),
    status: post.status === "PUBLISHED" ? "published" : post.status === "DRAFT" ? "draft" : post.status === "ARCHIVED" ? "archived" : "under-review",
    viewCount: post.viewsCount,
    seo: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt || undefined, canonical: post.canonicalUrl || undefined, keywords: post.seoKeywords, ogTitle: post.ogTitle || undefined, ogDescription: post.ogDescription || undefined, ogImage: post.ogImage || post.coverImage || undefined, twitterTitle: post.twitterTitle || undefined, twitterDescription: post.twitterDescription || undefined, twitterImage: post.twitterImage || post.coverImage || undefined },
    geo: { city: post.city || undefined, country: post.country || undefined, lat: post.latitude || undefined, lng: post.longitude || undefined },
  };
}

function caseStatusToUi(status: string, urgency: number): UiCaseStatus {
  if (status === "RESOLVED") return "resolved";
  if (status === "IN_PROGRESS" || status === "CONTACTED") return "in-progress";
  if (status === "UNDER_REVIEW" || status === "VERIFIED") return "under-review";
  return urgency >= 3 ? "urgent" : "under-review";
}

function caseTypeToUi(value: string): UiCaseType {
  const v = value.toLowerCase();
  if (v.includes("مرض") || v.includes("health") || v.includes("disease")) return "disease";
  if (v.includes("نزوح") || v.includes("displacement")) return "displacement";
  if (v.includes("تعليم") || v.includes("education")) return "education";
  if (v.includes("سكن") || v.includes("housing")) return "housing";
  if (v.includes("فقر") || v.includes("poverty")) return "poverty";
  return "other";
}

export function dbCaseToUi(item: CaseWithRelations): Case {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    region: item.region?.name || "غير محدد",
    type: caseTypeToUi(item.type),
    status: caseStatusToUi(item.status, item.urgencyLevel),
    urgencyLevel: Math.min(3, Math.max(1, item.urgencyLevel)) as 1 | 2 | 3,
    description: item.description,
    fullDescription: item.fullDescription || item.description,
    lastUpdated: item.lastUpdated.toISOString(),
    publishedAt: (item.publishedAt || item.createdAt).toISOString(),
    coverImage: item.coverImage || undefined,
    timeline: item.updates.map((update: CaseWithRelations["updates"][number]) => ({ id: update.id, date: update.createdAt.toISOString(), title: update.title, description: update.body, status: update.status ? caseStatusToUi(update.status, item.urgencyLevel) : undefined })),
    seo: { title: item.seoTitle || item.title, description: item.seoDescription || item.description },
    geo: { region: item.region?.name, country: item.region?.country, countryCode: item.region?.countryCode || undefined, lat: item.latitude || item.region?.latitude || undefined, lng: item.longitude || item.region?.longitude || undefined },
  };
}

const postInclude = { category: true, contributor: true, author: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } }, tags: { include: { tag: true } } };

export async function getPublishedArticles(limit = 12) {
  return safeQuery("published-articles", async () => {
    const posts = await prisma.post.findMany({ where: { status: "PUBLISHED", deletedAt: null, visibility: "PUBLIC" }, include: postInclude, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], take: limit });
    return posts.map((post: PostWithRelations) => postToArticle(post));
  }, [] as Article[]);
}

export async function getFeaturedArticlesFromDb(limit = 3) {
  return safeQuery("featured-articles", async () => {
    const posts = await prisma.post.findMany({ where: { status: "PUBLISHED", deletedAt: null, visibility: "PUBLIC", OR: [{ featured: true }, { isStoryOfDay: true }] }, include: postInclude, orderBy: [{ isStoryOfDay: "desc" }, { featured: "desc" }, { publishedAt: "desc" }], take: limit });
    return posts.map((post: PostWithRelations) => postToArticle(post));
  }, [] as Article[]);
}

export async function getArticlesByUiCategory(category: ArticleCategory, limit = 20) {
  const all = await getPublishedArticles(100);
  return all.filter((article: Article) => article.category === category).slice(0, limit);
}

export async function getArticleBySlugFromDb(slug: string) {
  const cleanSlug = decodeURIComponent(slug || "").trim();
  return safeQuery("article-by-slug", async () => {
    const post = await prisma.post.findFirst({ where: { slug: cleanSlug, status: "PUBLISHED", deletedAt: null, visibility: "PUBLIC" }, include: postInclude });
    return post ? postToArticle(post) : null;
  }, null);
}

export async function getRelatedArticlesFromDb(articleId: string, category: ArticleCategory, limit = 3) {
  const all = await getArticlesByUiCategory(category, limit + 5);
  return all.filter((article: Article) => article.id !== articleId).slice(0, limit);
}

export async function getPublishedCases(limit = 20) {
  return safeQuery("published-cases", async () => {
    const items = await prisma.case.findMany({ where: { status: { in: ["PUBLISHED", "CONTACTED", "IN_PROGRESS", "RESOLVED", "VERIFIED"] } }, include: { region: true, updates: true }, orderBy: [{ urgencyLevel: "desc" }, { lastUpdated: "desc" }], take: limit });
    return items.map((item: CaseWithRelations) => dbCaseToUi(item));
  }, [] as Case[]);
}

export async function getCaseBySlugFromDb(slug: string) {
  const cleanSlug = decodeURIComponent(slug || "").trim();
  return safeQuery("case-by-slug", async () => {
    const item = await prisma.case.findUnique({ where: { slug: cleanSlug }, include: { region: true, updates: true } });
    return item ? dbCaseToUi(item) : null;
  }, null);
}

export async function getContributorsFromDb(limit = 12) {
  return safeQuery("contributors", async () => {
    const contributors = await prisma.contributor.findMany({ where: { isActive: true }, include: { _count: { select: { posts: true } } }, orderBy: { createdAt: "desc" }, take: limit });
    return contributors.map((item: any): Author => ({ id: item.id, slug: item.slug, name: item.name, avatar: item.avatarUrl || undefined, bio: item.bio || "كاتب في منصة إنسانية - اجتماعية - ثقافية - علمية - متنوعة.", role: undefined, articlesCount: item._count.posts, social: { facebook: item.facebookUrl || undefined, instagram: item.instagramUrl || undefined, twitter: item.xUrl || undefined, whatsapp: item.whatsappUrl || undefined, telegram: item.telegramUrl || undefined, youtube: item.youtubeUrl || undefined, website: item.websiteUrl || undefined } }));
  }, [] as Author[]);
}

export async function getStatsFromDb() {
  return safeQuery("stats", async () => {
    const articles = await safeQuery("stats-posts", () => prisma.post.count({ where: { status: "PUBLISHED", deletedAt: null, visibility: "PUBLIC" } }), 0);
    const cases = await safeQuery("stats-cases", () => prisma.case.count(), 0);
    const contributors = await safeQuery("stats-contributors", () => prisma.contributor.count({ where: { isActive: true } }), 0);
    const submissions = await safeQuery("stats-submissions", () => prisma.submission.count(), 0);
    const regions = await safeQuery("stats-regions", () => prisma.region.count(), 0);
    return { stories: submissions, cases, articles, regions: Math.max(regions, contributors) };
  }, { stories: 0, cases: 0, articles: 0, regions: 0 });
}
