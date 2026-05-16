import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBearerPermission } from "@/lib/api-token-auth";
import { selectPushTargets, sendPushNotificationToTokens } from "@/lib/push-notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const { user, response } = await requireBearerPermission(request, "notifications:manage");
  if (response) return response;

  try {
    const body = await request.json().catch(() => null);
    const title = String(body?.title || "").trim();
    const messageBody = String(body?.body || body?.message || "").trim();
    const type = String(body?.type || "SYSTEM").trim().toUpperCase();
    const url = body?.url ? String(body.url) : null;
    const imageUrl = body?.imageUrl ? String(body.imageUrl) : null;

    if (!title || !messageBody) {
      return NextResponse.json({ ok: false, message: "عنوان الإشعار ونصه مطلوبان" }, { status: 400 });
    }

    const targets = await selectPushTargets(type);
    const result = await sendPushNotificationToTokens(targets.map((item) => item.token), { title, body: messageBody, type, url, imageUrl });
    const notification = await prisma.notification.create({
      data: {
        title,
        body: messageBody,
        type,
        url,
        imageUrl,
        target: "ALL",
        status: result.configured ? (result.failedCount ? "PARTIAL" : "SENT") : "SAVED",
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        error: result.error || null,
        sentAt: result.configured ? new Date() : null,
      },
    });

    await prisma.activityLog.create({ data: { action: "notification.sent", entity: "Notification", entityId: notification.id, userId: user?.id, metadata: { type, targets: targets.length, ...result } } }).catch(() => null);

    return NextResponse.json({ ok: true, notification, delivery: { targets: targets.length, ...result }, message: result.configured ? "تم إرسال الإشعار" : "تم حفظ الإشعار، لكن Firebase غير مفعل بعد" });
  } catch (error) {
    console.error("[api:v1:admin:notifications:send]", error);
    return NextResponse.json({ ok: false, message: "تعذر إرسال الإشعار" }, { status: 500 });
  }
}
