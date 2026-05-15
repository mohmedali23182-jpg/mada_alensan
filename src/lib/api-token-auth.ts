import "server-only";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, type Permission } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function getBearerUser(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
  const session = verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, isActive: true },
  });

  if (!user?.isActive) return null;
  return user;
}

export async function requireBearerPermission(request: Request, permission: Permission) {
  try {
    const user = await getBearerUser(request);
    if (!user || !hasPermission(user.role, permission)) {
      return { user: null, response: NextResponse.json({ ok: false, message: "غير مصرح" }, { status: 401 }) };
    }
    return { user, response: null };
  } catch (error) {
    console.error("[api-token-auth]", error);
    return { user: null, response: NextResponse.json({ ok: false, message: "تعذر التحقق من الجلسة" }, { status: 500 }) };
  }
}
