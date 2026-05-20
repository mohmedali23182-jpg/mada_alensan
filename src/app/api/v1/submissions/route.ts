import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJsonSafe, jsonOk, jsonError } from "@/lib/http-json";
import { notifyAdmin } from "@/lib/notifications";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const submissionApiSchema = z.object({
  fullName: z.string().trim().min(2, "الاسم الكامل مطلوب ويجب أن يحتوي على حرفين على الأقل"),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().optional().nullable(),
  title: z.string().trim().min(5, "عنوان المقال يجب أن يحتوي على 5 أحرف على الأقل"),
  summary: z.string().trim().optional().nullable().refine(
    (val) => !val || val.length >= 5, 
    { message: "نبذة الكاتب يجب أن تحتوي على 5 أحرف على الأقل إذا كتبتها" }
  ),
  body: z.string().trim().min(20, "نص المقال يجب أن يحتوي على 20 حرفًا على الأقل"),
  isAnonymous: z.boolean().default(false),
});

export async function POST(request: Request) {
  const rawBody = await readJsonSafe(request);
  if (!rawBody) {
    return jsonError("طلب غير صالح أو فارغ", 400);
  }

  const mapped = {
    fullName: rawBody.name || rawBody.fullName,
    email: rawBody.email,
    phone: rawBody.phone,
    title: rawBody.title,
    summary: rawBody.authorBio || rawBody.summary,
    body: rawBody.content || rawBody.body,
    isAnonymous: rawBody.isAnonymous === true || rawBody.isAnonymous === "true",
  };

  const parsed = submissionApiSchema.safeParse(mapped);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const errors = Object.fromEntries(
      Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] || "قيمة غير صحيحة"])
    );
    return jsonError("يرجى مراجعة الحقول المطلوبة.", 400, errors);
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        type: "ARTICLE",
        status: "SUBMITTED",
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        title: parsed.data.title,
        summary: parsed.data.summary || null,
        body: parsed.data.body,
        isAnonymous: parsed.data.isAnonymous,
        allowPublish: true,
      },
    });

    await notifyAdmin({
      subject: `مقال جديد من التطبيق: ${parsed.data.title}`,
      title: "وصل مقال جديد إلى مدى الإنسان",
      entity: "Submission",
      entityId: submission.id,
      lines: [
        `العنوان: ${parsed.data.title}`,
        `الكاتب: ${parsed.data.fullName}`,
        `البريد: ${parsed.data.email}`,
        parsed.data.phone ? `الهاتف: ${parsed.data.phone}` : "الهاتف: غير مرفق",
        parsed.data.summary ? `نبذة الكاتب: ${parsed.data.summary}` : "لا يوجد نبذة",
      ],
    }).catch(() => null);

    return jsonOk({
      submission,
      message: "تم إرسال المقال بنجاح، سنراجعه قبل النشر.",
    });
  } catch (error) {
    console.error("POST /api/v1/submissions error:", error);
    return jsonError("حدث خطأ أثناء حفظ المقال", 500);
  }
}
