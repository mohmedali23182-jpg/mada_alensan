import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { response } = await requirePermission("submissions:manage");
  if (response) return response;
  const items = await prisma.submission.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { media: true, region: true } });
  return NextResponse.json({ ok: true, items });
}
