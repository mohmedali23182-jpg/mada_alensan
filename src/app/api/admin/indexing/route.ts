import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/api-auth";
import { submitUrlsForIndexing } from "@/lib/indexing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const { response } = await requirePermission("settings:manage");
  if (response) return response;
  const body = await request.json().catch(() => null) as { urls?: string[]; url?: string } | null;
  const urls = body?.urls?.length ? body.urls : body?.url ? [body.url] : [];
  if (!urls.length) return NextResponse.json({ ok: false, message: "أرسل url أو urls" }, { status: 400 });
  const results = await submitUrlsForIndexing(urls);
  return NextResponse.json({ ok: true, results });
}
