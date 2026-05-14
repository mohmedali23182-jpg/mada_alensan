import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { safeServerMessage } from "./db-health";
import { hasPermission, type Permission } from "./permissions";

export async function requirePermission(permission: Permission) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, permission)) {
      return { user: null, response: NextResponse.json({ ok: false, message: "غير مصرح" }, { status: 401 }) };
    }
    return { user, response: null };
  } catch (error) {
    console.error("[api-auth]", safeServerMessage(error));
    return { user: null, response: NextResponse.json({ ok: false, message: "قاعدة البيانات غير جاهزة. افتح /setup وشغل db:setup." }, { status: 503 }) };
  }
}
