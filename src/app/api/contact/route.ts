import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readBody, normalizeEmptyStrings } from "@/lib/api-utils";
import { contactSchema } from "@/lib/validators";
import { notifyAdmin } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBody(request);
  const parsed = contactSchema.safeParse(normalizeEmptyStrings((body.data || {}) as Record<string, unknown>));
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.contactMessage.create({ data: parsed.data });
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
  return NextResponse.json({ ok: true, id: item.id });
}
