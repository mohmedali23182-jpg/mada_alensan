import "server-only";
type PrismaLike = any;

type SeoInput = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  seoKeywords?: string[] | null;
  noindex?: boolean | null;
  nofollow?: boolean | null;
  structuredData?: unknown;
};

type RevisionInput = {
  postId: string;
  title: string;
  excerpt?: string | null;
  content: string;
  contentJson?: unknown;
  editorId?: string | null;
  changeNote?: string | null;
  snapshot?: unknown;
};

export function estimateWordCount(content: string) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateReadingTime(content: string) {
  return Math.max(1, Math.ceil(estimateWordCount(content) / 220));
}

export function publishedAtForStatus(status: string, currentPublishedAt?: Date | null) {
  return status === "PUBLISHED" ? currentPublishedAt || new Date() : null;
}

export function normalizePostStatus(value: string) {
  const allowed = new Set(["DRAFT", "REVIEW", "NEEDS_EDIT", "APPROVED", "SCHEDULED", "PUBLISHED", "ARCHIVED", "REJECTED"]);
  return allowed.has(value) ? value : "DRAFT";
}

export async function syncPostSeo(prisma: PrismaLike, postId: string, input: SeoInput) {
  return prisma.postSeo.upsert({
    where: { postId },
    update: {
      metaTitle: input.seoTitle || null,
      metaDescription: input.seoDescription || null,
      canonicalUrl: input.canonicalUrl || null,
      ogTitle: input.ogTitle || null,
      ogDescription: input.ogDescription || null,
      ogImageUrl: input.ogImage || null,
      twitterTitle: input.twitterTitle || null,
      twitterDescription: input.twitterDescription || null,
      twitterImageUrl: input.twitterImage || null,
      keywords: input.seoKeywords || [],
      noindex: Boolean(input.noindex),
      nofollow: Boolean(input.nofollow),
      structuredData: input.structuredData || undefined,
    },
    create: {
      postId,
      metaTitle: input.seoTitle || null,
      metaDescription: input.seoDescription || null,
      canonicalUrl: input.canonicalUrl || null,
      ogTitle: input.ogTitle || null,
      ogDescription: input.ogDescription || null,
      ogImageUrl: input.ogImage || null,
      twitterTitle: input.twitterTitle || null,
      twitterDescription: input.twitterDescription || null,
      twitterImageUrl: input.twitterImage || null,
      keywords: input.seoKeywords || [],
      noindex: Boolean(input.noindex),
      nofollow: Boolean(input.nofollow),
      structuredData: input.structuredData || undefined,
    },
  }).catch(() => null);
}

export async function createPostRevision(prisma: PrismaLike, input: RevisionInput) {
  return prisma.postRevision.create({
    data: {
      postId: input.postId,
      title: input.title,
      excerpt: input.excerpt || null,
      content: input.content,
      contentJson: input.contentJson as never,
      editorId: input.editorId || null,
      changeNote: input.changeNote || null,
      snapshot: input.snapshot as never,
    },
  }).catch(() => null);
}

export async function recordPostWorkflow(prisma: PrismaLike, input: {
  postId: string;
  actorId?: string | null;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  note?: string | null;
  metadata?: unknown;
}) {
  return prisma.postWorkflowEvent.create({
    data: {
      postId: input.postId,
      actorId: input.actorId || null,
      action: input.action as never,
      fromStatus: input.fromStatus as never,
      toStatus: input.toStatus as never,
      note: input.note || null,
      metadata: input.metadata as never,
    },
  }).catch(() => null);
}

export async function ensurePostStats(prisma: PrismaLike, postId: string, viewsCount = 0) {
  return prisma.postStats.upsert({
    where: { postId },
    update: { viewsCount },
    create: { postId, viewsCount },
  }).catch(() => null);
}
