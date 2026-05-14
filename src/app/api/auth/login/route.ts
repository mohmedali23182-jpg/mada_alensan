import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { safeServerMessage } from "@/lib/db-health";
import { loginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function redirectToLogin(request: Request, reason: "invalid" | "db") {
  const url = new URL("/login", request.url);
  url.searchParams.set(reason === "db" ? "db" : "error", "1");
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
    if (!parsed.success) return redirectToLogin(request, "invalid");

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user?.isActive) return redirectToLogin(request, "invalid");

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) return redirectToLogin(request, "invalid");

    const token = createSessionToken({ userId: user.id, email: user.email, role: user.role });
    setSessionCookie(token);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => null);
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    console.error("[auth:login]", safeServerMessage(error));
    return redirectToLogin(request, "db");
  }
}
