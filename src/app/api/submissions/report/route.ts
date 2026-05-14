import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readBody, formFiles, normalizeEmptyStrings } from "@/lib/api-utils";
import { uploadToStorage } from "@/lib/storage";
import { caseReportSchema } from "@/lib/validators";
import { notifyAdmin } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBody(request);
  const parsed = caseReportSchema.safeParse(normalizeEmptyStrings((body.data || {}) as Record<string, unknown>));
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.submission.create({ data: { type: "CASE_REPORT", ...parsed.data } });

  const warnings: string[] = [];
  for (const file of formFiles(body.form)) {
    try {
      const uploaded = await uploadToStorage(file, `case-reports/${item.id}`);
      await prisma.media.create({ data: { ...uploaded, type: file.type.startsWith("image/") ? "IMAGE" : file.type === "application/pdf" ? "PDF" : file.type.startsWith("video/") ? "VIDEO" : file.type.startsWith("audio/") ? "AUDIO" : "DOCUMENT", submissionId: item.id } });
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "تعذر رفع أحد الملفات");
    }
  }

  await notifyAdmin({
    subject: `بلاغ حالة جديد: ${parsed.data.title}`,
    title: "وصل بلاغ حالة جديد إلى مدى الناس",
    entity: "Submission",
    entityId: item.id,
    lines: [
      `العنوان: ${parsed.data.title}`,
      parsed.data.caseType ? `نوع الحالة: ${parsed.data.caseType}` : "نوع الحالة: غير محدد",
      parsed.data.urgencyLevel ? `العاجلية: ${parsed.data.urgencyLevel}` : "العاجلية: غير محددة",
      parsed.data.phone ? `الهاتف: ${parsed.data.phone}` : "الهاتف: غير مرفق",
    ],
  }).catch(() => null);

  return NextResponse.json({ ok: true, id: item.id, warnings });
}
