import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.category.findMany({ where: { isActive: true }, orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true, description: true, icon: true, color: true, order: true } });
  return NextResponse.json({ ok: true, items });
}
