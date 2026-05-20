import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/api-token-auth";
import { afterPostMutation, afterPostPublishedToTelegram } from "@/lib/post-publish";
import { readJsonSafe, jsonOk, jsonError } from "@/lib/http-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return jsonError("المعرف غير صالح", 400);

  const { errorResponse } = await requireAdminPermission("posts:publish");
  if (errorResponse) return errorResponse;

  const body = await readJsonSafe(request);
  if (!body) return jsonError("طلب غير صالح أو فارغ", 400);

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return jsonError("المقال غير موجود", 404);

    const updateData: any = {};
    if (body.status) {
      updateData.status = body.status;
      if (body.status === "PUBLISHED") {
        updateData.publishedAt = new Date();
      } else {
        updateData.publishedAt = null;
      }
    }
    if (body.title) updateData.title = body.title;
    if (body.content) updateData.content = body.content;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);

    const item = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    await afterPostMutation({ slug: item.slug, status: item.status });
    if (item.status === "PUBLISHED") await afterPostPublishedToTelegram(item.id).catch(() => null);

    return jsonOk({ item });
  } catch (error) {
    console.error("PATCH /api/v1/admin/posts/[id] error:", error);
    return jsonError("حدث خطأ أثناء تحديث المقال", 500);
  }
}
