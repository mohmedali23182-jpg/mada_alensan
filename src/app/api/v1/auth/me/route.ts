import { NextResponse } from "next/server";
import { getBearerUser } from "@/lib/api-token-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getBearerUser(request);
  if (!user) return NextResponse.json({ ok: false, message: "غير مصرح" }, { status: 401 });
  return NextResponse.json({ ok: true, user });
}
