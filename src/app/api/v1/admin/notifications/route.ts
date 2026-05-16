import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBearerPermission } from "@/lib/api-token-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { response } = await requireBearerPermission(request, "notifications:manage");
  if (response) return response;
  const items = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ ok: true, items });
}
