import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return NextResponse.redirect(new URL("/login?error=1", request.url));

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.isActive) return NextResponse.redirect(new URL("/login?error=1", request.url));

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.redirect(new URL("/login?error=1", request.url));

  const token = createSessionToken({ userId: user.id, email: user.email, role: user.role });
  setSessionCookie(token);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return NextResponse.redirect(new URL("/admin", request.url));
}
