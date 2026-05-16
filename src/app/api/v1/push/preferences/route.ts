import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerUser } from "@/lib/api-token-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function bool(value: unknown, fallback = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "1", "yes", "on"].includes(value.toLowerCase());
  return fallback;
}

async function getToken(request: Request) {
  const { searchParams } = new URL(request.url);
  return (searchParams.get("token") || request.headers.get("x-device-token") || "").trim();
}

export async function GET(request: Request) {
  try {
    const token = await getToken(request);
    const user = await getBearerUser(request).catch(() => null);
    const preference = token
      ? await prisma.notificationPreference.findUnique({ where: { deviceToken: token } })
      : user
        ? await prisma.notificationPreference.findFirst({ where: { userId: user.id } })
        : null;

    return NextResponse.json({
      ok: true,
      preference: preference || { enableAll: true, newArticles: true, breakingNews: true, updates: true, systemMessages: true },
    });
  } catch (error) {
    console.error("[api:v1:push:preferences:get]", error);
    return NextResponse.json({ ok: false, message: "تعذر تحميل تفضيلات الإشعارات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const token = String(body?.token || request.headers.get("x-device-token") || "").trim();
    const user = await getBearerUser(request).catch(() => null);
    if (!token && !user) return NextResponse.json({ ok: false, message: "يلزم توكن الجهاز أو تسجيل الدخول" }, { status: 400 });

    const data = {
      enableAll: bool(body?.enableAll, true),
      newArticles: bool(body?.newArticles, true),
      breakingNews: bool(body?.breakingNews, true),
      updates: bool(body?.updates, true),
      systemMessages: bool(body?.systemMessages, true),
      userId: user?.id || null,
    };

    const preference = token
      ? await prisma.notificationPreference.upsert({ where: { deviceToken: token }, update: data, create: { ...data, deviceToken: token } })
      : await prisma.notificationPreference.create({ data });

    if (token) await prisma.pushDevice.updateMany({ where: { token }, data: { enabled: data.enableAll, userId: user?.id || undefined } }).catch(() => null);
    return NextResponse.json({ ok: true, preference, message: "تم تحديث تفضيلات الإشعارات" });
  } catch (error) {
    console.error("[api:v1:push:preferences:post]", error);
    return NextResponse.json({ ok: false, message: "تعذر تحديث تفضيلات الإشعارات" }, { status: 500 });
  }
}
