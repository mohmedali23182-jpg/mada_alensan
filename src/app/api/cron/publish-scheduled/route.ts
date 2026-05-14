import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishPostToTelegramChannel } from "@/lib/telegram";
import { recordPostWorkflow } from "@/lib/editorial-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const querySecret = new URL(request.url).searchParams.get("secret");
  return auth === `Bearer ${secret}` || querySecret === secret;
}

async function runScheduledPublisher(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  const duePosts = await prisma.post.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    take: 10,
    select: { id: true },
  });

  const results = [];
  for (const post of duePosts) {
    const claim = await prisma.post.updateMany({
      where: { id: post.id, status: "SCHEDULED" },
      data: { status: "PUBLISHED", publishedAt: new Date(), approvedAt: new Date() },
    });

    if (claim.count === 0) {
      results.push({ id: post.id, status: "skipped_already_processed" });
      continue;
    }

    try {
      await recordPostWorkflow(prisma, { postId: post.id, action: "PUBLISHED", fromStatus: "SCHEDULED", toStatus: "PUBLISHED", note: "نشر تلقائي عبر المجدول" });
      await publishPostToTelegramChannel(post.id);
      results.push({ id: post.id, status: "published_and_sent" });
    } catch (error) {
      results.push({ id: post.id, status: "published_telegram_failed", error: error instanceof Error ? error.message : "unknown" });
    }
  }

  return NextResponse.json({ ok: true, count: results.length, results });
}

export async function GET(request: Request) {
  return runScheduledPublisher(request);
}

export async function POST(request: Request) {
  return runScheduledPublisher(request);
}
