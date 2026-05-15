import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBearerPermission } from "@/lib/api-token-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { response } = await requireBearerPermission(request, "submissions:manage");
  if (response) return response;
  const items = await prisma.submission.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { media: true, region: true } });
  return NextResponse.json({ ok: true, items });
}
