import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readBody, formFiles, normalizeEmptyStrings } from "@/lib/api-utils";
import { uploadToStorage } from "@/lib/storage";
import { articleSubmissionSchema } from "@/lib/validators";
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

export async function GET() {
  return NextResponse.json({ ok: false, message: "استخدم POST لإرسال المقال." }, { status: 405 });
}

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const rawData = normalizeEmptyStrings((body.data || {}) as Record<string, unknown>);
    const parsed = articleSubmissionSchema.safeParse({ ...rawData, body: rawData.body || rawData.content });

    if (!parsed.success) {
      const firstMessage = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "بيانات المقال غير مكتملة";
      return NextResponse.json({ ok: false, message: firstMessage, errors: parsed.error.flatten() }, { status: 400 });
    }

    const item = await prisma.submission.create({
      data: {
        type: "ARTICLE",
        status: "SUBMITTED",
        source: "WEBSITE",
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        title: parsed.data.title,
        summary: parsed.data.summary || null,
        body: parsed.data.body,
        socialUrl: parsed.data.socialUrl || null,
        allowPublish: parsed.data.allowPublish,
        allowPhoto: parsed.data.allowPhoto,
        reviewNotes: rawData.authorBio ? `نبذة الكاتب: ${rawData.authorBio}` : null,
      },
    });

    const warnings: string[] = [];
    for (const file of formFiles(body.form, ["attachments", "coverImage", "avatar"])) {
      try {
        const uploaded = await uploadToStorage(file, `submissions/${item.id}`);
        await prisma.media.create({ data: { ...uploaded, type: mediaType(file.type) as never, submissionId: item.id } });
        await prisma.activityLog.create({ data: { action: "media.uploaded", entity: "Submission", entityId: item.id, metadata: { filename: file.name, mimeType: file.type } } }).catch(() => null);
      } catch (error) {
        console.error("[submissions:article:upload]", error);
        warnings.push(error instanceof Error ? error.message : "تعذر رفع أحد الملفات");
      }
    }

    await prisma.activityLog.create({
      data: {
        action: "submission.article.created",
        entity: "Submission",
        entityId: item.id,
        metadata: { title: item.title, email: item.email },
      },
    }).catch(() => null);

    await notifyAdmin({
      subject: `مقال جديد بانتظار المراجعة: ${parsed.data.title}`,
      title: "وصل مقال جديد إلى منصة مدى الإنسان",
      entity: "Submission",
      entityId: item.id,
      lines: [
        `العنوان: ${parsed.data.title}`,
        `الكاتب: ${parsed.data.fullName}`,
        `البريد: ${parsed.data.email}`,
        parsed.data.phone ? `الهاتف: ${parsed.data.phone}` : "الهاتف: غير مرفق",
        parsed.data.summary ? `الملخص: ${parsed.data.summary}` : "لا يوجد ملخص",
      ],
    }).catch((error) => console.error("[submissions:article:notify]", error));

    return NextResponse.json({ ok: true, id: item.id, message: "تم إرسال المقال بنجاح، سنراجعه قبل النشر.", warnings });
  } catch (error) {
    console.error("[submissions:article]", error);
    return NextResponse.json({ ok: false, message: "تعذر إرسال المقال حاليًا. حاول لاحقًا." }, { status: 500 });
  }
}
