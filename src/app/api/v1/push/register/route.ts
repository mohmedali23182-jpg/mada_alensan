import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerUser } from "@/lib/api-token-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const token = String(body?.token || "").trim();
    const platform = String(body?.platform || "android").trim().toLowerCase();
    if (!token || token.length < 20) {
      return NextResponse.json({ ok: false, message: "توكن الجهاز غير صالح" }, { status: 400 });
    }

    const user = await getBearerUser(request).catch(() => null);
    const device = await prisma.pushDevice.upsert({
      where: { token },
      update: { platform, enabled: true, appVersion: body?.appVersion || null, locale: body?.locale || "ar", userId: user?.id || null, lastSeenAt: new Date() },
      create: { token, platform, enabled: true, appVersion: body?.appVersion || null, locale: body?.locale || "ar", userId: user?.id || null, lastSeenAt: new Date() },
    });

    await prisma.notificationPreference.upsert({
      where: { deviceToken: token },
      update: {},
      create: { deviceToken: token, userId: user?.id || null },
    });

    return NextResponse.json({ ok: true, deviceId: device.id, message: "تم تفعيل الإشعارات" });
  } catch (error) {
    console.error("[api:v1:push:register]", error);
    return NextResponse.json({ ok: false, message: "تعذر تسجيل جهاز الإشعارات" }, { status: 500 });
  }
}
