import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 30)));
    const items = await prisma.notification.findMany({
      where: { status: { in: ["SENT", "SAVED"] } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("[api:v1:notifications]", error);
    return NextResponse.json({ ok: false, message: "تعذر تحميل الإشعارات" }, { status: 500 });
  }
}
