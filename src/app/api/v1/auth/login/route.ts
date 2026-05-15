import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { safeServerMessage } from "@/lib/db-health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: false, message: "تسجيل الدخول يتطلب طلب POST." }, { status: 405 });
}

async function readLoginBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return request.json().catch(() => ({}));
  }
  const form = await request.formData().catch(() => null);
  return form ? Object.fromEntries(form.entries()) : {};
}

export async function POST(request: Request) {
  try {
    const body = await readLoginBody(request);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const firstMessage = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "بيانات الدخول غير مكتملة";
      return NextResponse.json({ ok: false, message: firstMessage, errors: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, isActive: true, passwordHash: true },
    });

    if (!user?.isActive || !user.passwordHash) {
      return NextResponse.json({ ok: false, message: "بيانات الدخول غير صحيحة أو الحساب غير مفعل" }, { status: 401 });
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return NextResponse.json({ ok: false, message: "بيانات الدخول غير صحيحة أو الحساب غير مفعل" }, { status: 401 });

    const token = createSessionToken({ userId: user.id, email: user.email, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => null);
    await prisma.activityLog.create({ data: { action: "api.auth.login", entity: "User", entityId: user.id, metadata: { surface: "api-v1" } } }).catch(() => null);

    return NextResponse.json({
      ok: true,
      token,
      tokenType: "Bearer",
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    });
  } catch (error) {
    console.error("[api:v1:auth:login]", safeServerMessage(error));
    return NextResponse.json({ ok: false, message: "تعذر تسجيل الدخول حاليًا" }, { status: 500 });
  }
}
