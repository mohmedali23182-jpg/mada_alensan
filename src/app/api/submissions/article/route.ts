import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readBody, formFiles, normalizeEmptyStrings } from "@/lib/api-utils";
import { uploadToStorage } from "@/lib/storage";
import { articleSubmissionSchema } from "@/lib/validators";
import { notifyAdmin } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBody(request);
  const parsed = articleSubmissionSchema.safeParse(normalizeEmptyStrings((body.data || {}) as Record<string, unknown>));
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });

  const item = await prisma.submission.create({
    data: {
      type: "ARTICLE",
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      title: parsed.data.title,
      summary: parsed.data.summary,
      body: parsed.data.body,
      socialUrl: parsed.data.socialUrl,
      allowPublish: parsed.data.allowPublish,
      allowPhoto: parsed.data.allowPhoto,
    },
  });

  const warnings: string[] = [];
  for (const file of formFiles(body.form, ["attachments", "coverImage", "avatar"])) {
    try {
      const uploaded = await uploadToStorage(file, `submissions/${item.id}`);
      await prisma.media.create({ data: { ...uploaded, type: file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT", submissionId: item.id } });
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "تعذر رفع أحد الملفات");
    }
  }

  await notifyAdmin({
    subject: `مقال جديد بانتظار المراجعة: ${parsed.data.title}`,
    title: "وصل مقال جديد إلى مدى الناس",
    entity: "Submission",
    entityId: item.id,
    lines: [
      `العنوان: ${parsed.data.title}`,
      `الكاتب: ${parsed.data.fullName}`,
      `البريد: ${parsed.data.email}`,
      parsed.data.phone ? `الهاتف: ${parsed.data.phone}` : "الهاتف: غير مرفق",
      parsed.data.summary ? `الملخص: ${parsed.data.summary}` : "لا يوجد ملخص",
    ],
  }).catch(() => null);

  return NextResponse.json({ ok: true, id: item.id, warnings });
}
