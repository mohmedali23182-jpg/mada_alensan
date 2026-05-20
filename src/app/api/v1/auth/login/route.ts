import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { readJsonSafe, jsonOk, jsonError } from "@/lib/http-json";
import { loginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return jsonError("Use POST to login", 405);
}

export async function POST(request: Request) {
  const body = await readJsonSafe(request);
  if (!body) {
    return jsonError("بيانات الدخول غير صالحة أو فارغة", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("يرجى مراجعة الحقول المطلوبة بشكل صحيح", 400);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user || !user.isActive) {
      return jsonError("بيانات الدخول غير صحيحة أو الحساب غير مفعل", 401);
    }

    const isMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!isMatch) {
      return jsonError("بيانات الدخول غير صحيحة أو الحساب غير مفعل", 401);
    }

    // Generate token
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return jsonOk({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return jsonError("حدث خطأ أثناء محاولة تسجيل الدخول", 500);
  }
}
