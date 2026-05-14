import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readBody, normalizeEmptyStrings } from "@/lib/api-utils";
import { contactSchema } from "@/lib/validators";
import { notifyAdmin } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const parsed = contactSchema.safeParse(normalizeEmptyStrings((body.data || {}) as Record<string, unknown>));
    if (!parsed.success) {
      const firstMessage = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "بيانات الرسالة غير مكتملة";
      return NextResponse.json({ ok: false, message: firstMessage, errors: parsed.error.flatten() }, { status: 400 });
    }
    const item = await prisma.contactMessage.create({ data: parsed.data });
    await prisma.activityLog.create({ data: { action: "contact.created", entity: "ContactMessage", entityId: item.id, metadata: { subject: item.subject, email: item.email } } }).catch(() => null);
    await notifyAdmin({
      subject: `رسالة تواصل جديدة: ${parsed.data.subject || parsed.data.name}`,
      title: "وصلت رسالة تواصل جديدة",
      entity: "ContactMessage",
      entityId: item.id,
      lines: [
        `الاسم: ${parsed.data.name}`,
        parsed.data.email ? `البريد: ${parsed.data.email}` : "البريد: غير مرفق",
        parsed.data.phone ? `الهاتف: ${parsed.data.phone}` : "الهاتف: غير مرفق",
        parsed.data.subject ? `الموضوع: ${parsed.data.subject}` : "بدون موضوع",
        `الرسالة: ${parsed.data.message}`,
      ],
    }).catch((error) => console.error("[contact:notify]", error));
    return NextResponse.json({ ok: true, id: item.id, message: "تم إرسال رسالتك بنجاح." });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json({ ok: false, message: "تعذر إرسال الرسالة. تأكد من إعداد قاعدة البيانات وحاول مرة أخرى." }, { status: 500 });
  }
}
