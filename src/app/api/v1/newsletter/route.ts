import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJsonSafe, jsonOk, jsonError } from "@/lib/http-json";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const newsletterSchema = z.object({
  email: z.string().trim().email("البريد الإلكتروني غير صحيح"),
});

export async function POST(request: Request) {
  const body = await readJsonSafe(request);
  if (!body) {
    return jsonError("طلب غير صالح أو فارغ", 400);
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message || "البريد الإلكتروني غير صحيح", 400);
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return jsonOk({
        message: "هذا البريد مشترك مسبقًا",
        alreadySubscribed: true,
      });
    }

    await prisma.newsletterSubscriber.create({
      data: { email },
    });

    return jsonOk({
      message: "تم الاشتراك في النشرة بنجاح",
      alreadySubscribed: false,
    });
  } catch (error) {
    console.error("POST /api/v1/newsletter error:", error);
    return jsonError("حدث خطأ أثناء الاشتراك في النشرة", 500);
  }
}
