import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/api-token-auth";
import { jsonOk, jsonError } from "@/lib/http-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { errorResponse } = await requireAdminPermission("submissions:manage");
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const where: any = {};
    if (type) where.type = type as any;
    if (status) where.status = status as any;

    const items = await prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { region: true, media: true },
    });

    return jsonOk({ items });
  } catch (error) {
    console.error("GET /api/v1/admin/submissions error:", error);
    return jsonError("حدث خطأ أثناء جلب الوارد", 500);
  }
}
