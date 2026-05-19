import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readBody, formFiles, normalizeEmptyStrings } from "@/lib/api-utils";
import { uploadToStorage } from "@/lib/storage";
import { storySubmissionSchema } from "@/lib/validators";
import { notifyAdmin } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBody(request);
  const parsed = storySubmissionSchema.safeParse(normalizeEmptyStrings((body.data || {}) as Record<string, unknown>));
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.submission.create({ data: { type: "STORY", ...parsed.data } });

  const warnings: string[] = [];
  for (const file of formFiles(body.form)) {
    try {
      const uploaded = await uploadToStorage(file, `stories/${item.id}`);
      await prisma.media.create({ data: { ...uploaded, type: file.type.startsWith("image/") ? "IMAGE" : file.type.startsWith("video/") ? "VIDEO" : file.type.startsWith("audio/") ? "AUDIO" : "DOCUMENT", submissionId: item.id } });
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "تعذر رفع أحد الملفات");
    }
  }

  await notifyAdmin({
    subject: `قصة جديدة بانتظار المراجعة: ${parsed.data.title || "بدون عنوان"}`,
    title: "وصلت قصة جديدة إلى مدى الناس",
    entity: "Submission",
    entityId: item.id,
    lines: [
      `العنوان: ${parsed.data.title || "بدون عنوان"}`,
      `الاسم: ${parsed.data.isAnonymous ? "مخفي" : parsed.data.fullName || "غير مرفق"}`,
      parsed.data.phone ? `الهاتف: ${parsed.data.phone}` : "الهاتف: غير مرفق",
      parsed.data.email ? `البريد: ${parsed.data.email}` : "البريد: غير مرفق",
      `النشر مسموح: ${parsed.data.allowPublish ? "نعم" : "لا"}`,
    ],
  }).catch(() => null);

  return NextResponse.json({ ok: true, id: item.id, warnings });
}
