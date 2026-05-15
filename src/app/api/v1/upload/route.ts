import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToStorage } from "@/lib/storage";
import { requireBearerPermission } from "@/lib/api-token-auth";

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
  const { user, response } = await requireBearerPermission(request, "media:manage");
  if (response) return response;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ ok: false, message: "لم يتم إرسال ملف" }, { status: 400 });
    const uploaded = await uploadToStorage(file, String(form.get("folder") || "mobile"));
    const media = await prisma.media.create({
      data: {
        ...uploaded,
        type: mediaType(file.type) as never,
        uploadedById: user?.id,
        altText: String(form.get("altText") || "") || null,
        caption: String(form.get("caption") || "") || null,
      },
    });
    await prisma.activityLog.create({ data: { action: "media.uploaded", entity: "Media", entityId: media.id, userId: user?.id, metadata: { surface: "api-v1" } } }).catch(() => null);
    return NextResponse.json({ ok: true, media });
  } catch (error) {
    console.error("[api:v1:upload]", error);
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "فشل رفع الملف" }, { status: 500 });
  }
}
