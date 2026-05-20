import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/api-token-auth";
import { readJsonSafe, jsonOk, jsonError } from "@/lib/http-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return jsonError("المعرف غير صالح", 400);

  const { errorResponse } = await requireAdminPermission("submissions:manage");
  if (errorResponse) return errorResponse;

  const body = await readJsonSafe(request);
  if (!body) return jsonError("طلب غير صالح أو فارغ", 400);

  try {
    const existing = await prisma.submission.findUnique({ where: { id } });
    if (!existing) return jsonError("الطلب غير موجود", 404);

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.reviewNotes !== undefined) updateData.reviewNotes = body.reviewNotes;

    const item = await prisma.submission.update({
      where: { id },
      data: updateData,
    });

    return jsonOk({ item });
  } catch (error) {
    console.error("PATCH /api/v1/admin/submissions/[id] error:", error);
    return jsonError("حدث خطأ أثناء تحديث الطلب", 500);
  }
}
