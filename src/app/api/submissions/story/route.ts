import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readBody, formFiles, normalizeEmptyStrings } from "@/lib/api-utils";
import { uploadToStorage } from "@/lib/storage";
import { storySubmissionSchema } from "@/lib/validators";
import { notifyAdmin } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function mediaType(mime: string) {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  if (mime === "application/pdf") return "PDF";
  return "DOCUMENT";
}

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const parsed = storySubmissionSchema.safeParse(normalizeEmptyStrings((body.data || {}) as Record<string, unknown>));
    if (!parsed.success) {
      const firstMessage = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "بيانات القصة غير مكتملة";
      return NextResponse.json({ ok: false, message: firstMessage, errors: parsed.error.flatten() }, { status: 400 });
    }

    const item = await prisma.submission.create({ data: { type: "STORY", source: "WEBSITE", ...parsed.data } });

    const warnings: string[] = [];
    for (const file of formFiles(body.form)) {
      try {
        const uploaded = await uploadToStorage(file, `stories/${item.id}`);
        await prisma.media.create({ data: { ...uploaded, type: mediaType(file.type) as never, submissionId: item.id } });
        await prisma.activityLog.create({ data: { action: "media.uploaded", entity: "Submission", entityId: item.id, metadata: { filename: file.name, mimeType: file.type } } }).catch(() => null);
      } catch (error) {
        console.error("[submissions:story:upload]", error);
        warnings.push(error instanceof Error ? error.message : "تعذر رفع أحد الملفات");
      }
    }

    await prisma.activityLog.create({ data: { action: "submission.story.created", entity: "Submission", entityId: item.id, metadata: { title: item.title, isAnonymous: item.isAnonymous } } }).catch(() => null);

    await notifyAdmin({
      subject: `قصة جديدة بانتظار المراجعة: ${parsed.data.title}`,
      title: "وصلت قصة جديدة إلى مدى الإنسان",
      entity: "Submission",
      entityId: item.id,
      lines: [
        `العنوان: ${parsed.data.title}`,
        `الاسم: ${parsed.data.isAnonymous ? "مخفي" : parsed.data.fullName || "غير مرفق"}`,
        parsed.data.phone ? `الهاتف: ${parsed.data.phone}` : "الهاتف: غير مرفق",
        parsed.data.email ? `البريد: ${parsed.data.email}` : "البريد: غير مرفق",
        `النشر مسموح: ${parsed.data.allowPublish ? "نعم" : "لا"}`,
      ],
    }).catch((error) => console.error("[submissions:story:notify]", error));

    return NextResponse.json({ ok: true, id: item.id, message: "تم إرسال القصة بنجاح، سنراجعها قبل النشر.", warnings });
  } catch (error) {
    console.error("[submissions:story]", error);
    return NextResponse.json({ ok: false, message: "تعذر إرسال القصة. تأكد من إعداد قاعدة البيانات وحاول مرة أخرى." }, { status: 500 });
  }
}
