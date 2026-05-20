import { headers } from "next/headers";
import { verifySessionToken } from "./auth";
import { prisma } from "./prisma";
import { hasPermission, type Permission, canAccessAdmin } from "./permissions";
import { jsonError } from "./http-json";

export async function authenticateBearerToken() {
  const authHeader = headers().get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, errorResponse: jsonError("غير مصرح - يرجى تقديم Token صالح", 401) };
  }
  const token = authHeader.substring(7);
  const session = verifySessionToken(token);
  if (!session) {
    return { user: null, errorResponse: jsonError("غير مصرح - انتهت صلاحية الجلسة أو Token غير صالح", 401) };
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, isActive: true },
    });
    if (!user || !user.isActive) {
      return { user: null, errorResponse: jsonError("الحساب غير موجود أو غير نشط", 401) };
    }
    return { user, errorResponse: null };
  } catch (err) {
    return { user: null, errorResponse: jsonError("خطأ في التحقق من الحساب", 500) };
  }
}

export async function requireAdminPermission(permission: Permission) {
  const { user, errorResponse } = await authenticateBearerToken();
  if (errorResponse) return { user: null, errorResponse };
  
  if (!hasPermission(user.role, permission) || !canAccessAdmin(user.role)) {
    return { user: null, errorResponse: jsonError("غير مسموح - ليس لديك الصلاحية الكافية", 403) };
  }
  return { user, errorResponse: null };
}
