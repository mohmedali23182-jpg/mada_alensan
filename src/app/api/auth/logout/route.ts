import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  clearSessionCookie();
  return NextResponse.redirect(new URL("/", request.url));
}
