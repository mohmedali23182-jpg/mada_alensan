import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { response } = await requirePermission("settings:manage");
  if (response) return response;
  const items = await prisma.socialLink.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const { response } = await requirePermission("settings:manage");
  if (response) return response;
  const body = await request.json().catch(() => null) as Record<string, string | boolean | number> | null;
  if (!body?.platform || !body.url) return NextResponse.json({ ok: false, message: "المنصة والرابط مطلوبان" }, { status: 400 });
  const item = await prisma.socialLink.create({ data: { platform: String(body.platform), label: String(body.label || body.platform), url: String(body.url), icon: body.icon ? String(body.icon) : undefined } });
  return NextResponse.json({ ok: true, item });
}
