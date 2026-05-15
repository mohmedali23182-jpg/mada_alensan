import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBearerPermission } from "@/lib/api-token-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { response } = await requireBearerPermission(request, "dashboard:read");
  if (response) return response;

  const [posts, submissions, contacts, subscribers] = await Promise.all([
    prisma.post.count().catch(() => 0),
    prisma.submission.count().catch(() => 0),
    prisma.contactMessage.count().catch(() => 0),
    prisma.newsletterSubscriber.count().catch(() => 0),
  ]);

  return NextResponse.json({ ok: true, stats: { posts, submissions, contacts, subscribers } });
}
