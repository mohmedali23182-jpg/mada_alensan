import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));
  const items = await getPublishedArticles(limit);
  return NextResponse.json({ ok: true, items, meta: { limit, surface: "public-api-v1" } });
}
