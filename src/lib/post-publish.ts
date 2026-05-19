import "server-only";
import { revalidatePath } from "next/cache";
import { submitUrlsForIndexing } from "./indexing";
import { publishPostToTelegramChannel } from "./telegram";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

export async function afterPostMutation(input: { slug: string; status?: string; publishToTelegram?: boolean }) {
  const articlePath = `/articles/${input.slug}`;
  revalidatePath("/");
  revalidatePath(articlePath);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidatePath("/news");
  revalidatePath("/stories");
  revalidatePath("/opinions");

  const isPublished = input.status === "PUBLISHED";
  if (!isPublished) return { revalidated: true, indexed: false };

  const url = SITE_URL ? `${SITE_URL}${articlePath}` : articlePath;
  const [indexing] = await Promise.allSettled([submitUrlsForIndexing([url, `${SITE_URL}/sitemap.xml`, `${SITE_URL}/feed.xml`])]);
  return { revalidated: true, indexed: indexing.status === "fulfilled" ? indexing.value : indexing.reason };
}

export async function afterPostPublishedToTelegram(postId: string) {
  if (process.env.TELEGRAM_AUTOPUBLISH_FROM_ADMIN !== "true") return { skipped: true };
  return publishPostToTelegramChannel(postId);
}
