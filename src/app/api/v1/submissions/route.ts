import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readBody, formFiles, normalizeEmptyStrings } from "@/lib/api-utils";
import { uploadToStorage } from "@/lib/storage";
import { articleSubmissionSchema, storySubmissionSchema } from "@/lib/validators";
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

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "1", "yes", "on"].includes(value.toLowerCase());
  return fallback;
}

export async function GET() {
  return NextResponse.json({ ok: false, message: "استخدم POST لإرسال مساهمة." }, { status: 405 });
}

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const raw = normalizeEmptyStrings((body.data || {}) as Record<string, unknown>);
    const type = String(raw.type || raw.submissionType || "STORY").toUpperCase();
    const normalized = {
      ...raw,
      fullName: raw.fullName || raw.name,
      body: raw.body || raw.content || raw.story,
      allowPublish: raw.allowPublish ?? true,
    };

    const isArticle = type === "ARTICLE";
    const parsed = isArticle ? articleSubmissionSchema.safeParse(normalized) : storySubmissionSchema.safeParse(normalized);
    if (!parsed.success) {
      const firstMessage = Object.values(parsed.error.flatten().fieldErrors).flat()[0] || "بيانات المشاركة غير مكتملة";
      return NextResponse.json({ ok: false, message: firstMessage, errors: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data as any;
    const item = await prisma.submission.create({
      data: {
        type: isArticle ? "ARTICLE" : "STORY",
        status: "SUBMITTED",
        source: "WEBSITE",
        fullName: data.fullName || null,
        email: data.email || null,
        phone: data.phone || null,
        isAnonymous: isArticle ? false : toBoolean(data.isAnonymous),
        title: data.title,
        summary: data.summary || null,
        body: data.body,
        socialUrl: data.socialUrl || null,
        allowPublish: toBoolean(data.allowPublish, true),
        allowPhoto: toBoolean(data.allowPhoto),
        reviewNotes: raw.authorBio ? `نبذة الكاتب: ${raw.authorBio}` : null,
      },
    });

    const warnings: string[] = [];
    for (const file of formFiles(body.form, ["attachments", "files", "coverImage", "avatar"])) {
      try {
        const uploaded = await uploadToStorage(file, `submissions/${item.id}`);
        await prisma.media.create({ data: { ...uploaded, type: mediaType(file.type) as never, submissionId: item.id } });
      } catch (error) {
        console.error("[api:v1:submissions:upload]", error);
        warnings.push(error instanceof Error ? error.message : "تعذر رفع أحد الملفات");
      }
    }

    await prisma.activityLog.create({ data: { action: isArticle ? "submission.article.created" : "submission.story.created", entity: "Submission", entityId: item.id, metadata: { title: item.title, source: "api-v1" } } }).catch(() => null);

    await notifyAdmin({
      subject: `${isArticle ? "مقال" : "قصة"} جديد بانتظار المراجعة: ${data.title}`,
      title: isArticle ? "وصل مقال جديد إلى منصة مدى الإنسان" : "وصلت قصة جديدة إلى منصة مدى الإنسان",
      entity: "Submission",
      entityId: item.id,
      lines: [
        `العنوان: ${data.title}`,
        `الاسم: ${data.isAnonymous ? "مخفي" : data.fullName || "غير مرفق"}`,
        data.email ? `البريد: ${data.email}` : "البريد: غير مرفق",
        data.phone ? `الهاتف: ${data.phone}` : "الهاتف: غير مرفق",
      ],
    }).catch((error) => console.error("[api:v1:submissions:notify]", error));

    return NextResponse.json({ ok: true, id: item.id, message: isArticle ? "تم إرسال المقال بنجاح، سنراجعه قبل النشر." : "تم إرسال مشاركتك بنجاح، سنراجعها قبل النشر.", warnings });
  } catch (error) {
    console.error("[api:v1:submissions]", error);
    return NextResponse.json({ ok: false, message: "تعذر إرسال المشاركة حاليًا. حاول لاحقًا." }, { status: 500 });
  }
}
