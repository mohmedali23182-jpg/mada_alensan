import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  name: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const data = contentType.includes("form") ? Object.fromEntries((await request.formData()).entries()) : await request.json().catch(() => ({}));
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const firstMessage = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "بيانات الاشتراك غير صحيحة";
      return NextResponse.json({ ok: false, message: firstMessage, errors: parsed.error.flatten() }, { status: 400 });
    }

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { name: parsed.data.name || undefined, status: "ACTIVE", source: parsed.data.source || "WEBSITE", unsubscribedAt: null },
      create: { email: parsed.data.email, name: parsed.data.name, source: parsed.data.source || "WEBSITE" },
    });

    await prisma.activityLog.create({ data: { action: "newsletter.subscribed", entity: "NewsletterSubscriber", entityId: subscriber.id, metadata: { email: subscriber.email } } }).catch(() => null);
    await notifyAdmin({ subject: "اشتراك جديد في النشرة", title: "وصل اشتراك جديد في النشرة البريدية", entity: "NewsletterSubscriber", entityId: subscriber.id, lines: [`البريد: ${subscriber.email}`, subscriber.name ? `الاسم: ${subscriber.name}` : "الاسم: غير مرفق"] }).catch(() => null);

    return NextResponse.json({ ok: true, message: "تم الاشتراك بنجاح." });
  } catch (error) {
    console.error("[newsletter]", error);
    return NextResponse.json({ ok: false, message: "تعذر الاشتراك الآن. حاول مرة أخرى." }, { status: 500 });
  }
}
