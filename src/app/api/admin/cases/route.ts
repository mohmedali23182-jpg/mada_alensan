import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { response } = await requirePermission("cases:manage");
  if (response) return response;
  const items = await prisma.case.findMany({ orderBy: { updatedAt: "desc" }, include: { region: true, updates: { orderBy: { createdAt: "desc" }, take: 3 } } });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const { response } = await requirePermission("cases:manage");
  if (response) return response;
  const body = await request.json().catch(() => null) as Record<string, string> | null;
  if (!body?.title || !body.slug || !body.description) return NextResponse.json({ ok: false, message: "العنوان والرابط والوصف مطلوبة" }, { status: 400 });
  const item = await prisma.case.upsert({
    where: { slug: body.slug },
    update: { title: body.title, type: body.type || "other", description: body.description, fullDescription: body.fullDescription, responsibleEntity: body.responsibleEntity },
    create: { title: body.title, slug: body.slug, type: body.type || "other", description: body.description, fullDescription: body.fullDescription, responsibleEntity: body.responsibleEntity },
  });
  return NextResponse.json({ ok: true, item });
}
