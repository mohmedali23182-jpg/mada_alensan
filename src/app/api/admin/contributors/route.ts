import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { contributorSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { response } = await requirePermission("contributors:manage");
  if (response) return response;
  const items = await prisma.contributor.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { posts: true } } } });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const { response } = await requirePermission("contributors:manage");
  if (response) return response;
  const body = await request.json().catch(() => null);
  const parsed = contributorSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.contributor.upsert({ where: { slug: parsed.data.slug }, update: parsed.data, create: parsed.data });
  return NextResponse.json({ ok: true, item });
}
