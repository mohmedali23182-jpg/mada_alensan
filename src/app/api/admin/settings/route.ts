import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { response } = await requirePermission("settings:manage");
  if (response) return response;
  const items = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const { response } = await requirePermission("settings:manage");
  if (response) return response;
  const body = await request.json().catch(() => null) as { key?: string; value?: unknown } | null;
  if (!body?.key) return NextResponse.json({ ok: false, message: "مفتاح الإعداد مطلوب" }, { status: 400 });
  const item = await prisma.siteSetting.upsert({ where: { key: body.key }, update: { value: body.value ?? {} }, create: { key: body.key, value: body.value ?? {} } });
  return NextResponse.json({ ok: true, item });
}
