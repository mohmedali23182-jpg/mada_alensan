import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJsonSafe, jsonOk, jsonError } from "@/lib/http-json";
import { contactSchema } from "@/lib/validators";
import { notifyAdmin } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJsonSafe(request);
  if (!body) {
    return jsonError("طلب غير صالح أو فارغ", 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errors = Object.fromEntries(
      Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] || "قيمة غير صحيحة"])
    );
    return jsonError("يرجى مراجعة الحقول المطلوبة.", 400, errors);
  }

  try {
    const item = await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
      },
    });

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
    }).catch(() => null);

    return jsonOk({
      id: item.id,
      message: "تم إرسال رسالتك بنجاح، سنرد عليك قريبًا.",
    });
  } catch (error) {
    console.error("POST /api/v1/contact error:", error);
    return jsonError("حدث خطأ أثناء حفظ الرسالة", 500);
  }
}
