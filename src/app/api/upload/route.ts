import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToStorage } from "@/lib/storage";
import { requirePermission } from "@/lib/api-auth";

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
  const { user, response } = await requirePermission("media:manage");
  if (response) return response;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "لم يتم إرسال ملف" }, { status: 400 });
    }

    // Enforce 5MB limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, message: "حجم الملف أكبر من الحد المسموح به (5 ميجابايت)" }, { status: 400 });
    }

    // Enforce allowed types
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ ok: false, message: "نوع الملف غير مدعوم. الأنواع المسموحة هي: JPEG, PNG, WEBP, SVG" }, { status: 400 });
    }

    const uploaded = await uploadToStorage(file, String(form.get("folder") || "uploads"));
    const media = await prisma.media.create({
      data: {
        ...uploaded,
        type: mediaType(file.type) as never,
        uploadedById: user?.id,
        altText: String(form.get("altText") || "") || null,
        caption: String(form.get("caption") || "") || null,
      },
    });

    return NextResponse.json({ ok: true, media });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "فشل رفع الملف" }, { status: 500 });
  }
}
