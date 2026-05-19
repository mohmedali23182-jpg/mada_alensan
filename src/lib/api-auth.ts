import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { hasPermission, type Permission } from "./permissions";

export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user.role, permission)) {
    return { user: null, response: NextResponse.json({ ok: false, message: "غير مصرح" }, { status: 401 }) };
  }
  return { user, response: null };
}
