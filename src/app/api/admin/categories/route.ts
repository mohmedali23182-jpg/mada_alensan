import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { categorySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { response } = await requirePermission("categories:manage");
  if (response) return response;
  const items = await prisma.category.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const { response } = await requirePermission("categories:manage");
  if (response) return response;
  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.category.upsert({ where: { slug: parsed.data.slug }, update: parsed.data, create: parsed.data });
  return NextResponse.json({ ok: true, item });
}
