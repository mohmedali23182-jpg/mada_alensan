import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/api-token-auth";
import { jsonOk, jsonError } from "@/lib/http-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { errorResponse } = await requireAdminPermission("categories:manage");
  if (errorResponse) return errorResponse;

  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { posts: true } } },
    });

    return jsonOk({ categories });
  } catch (error) {
    console.error("GET /api/v1/admin/categories error:", error);
    return jsonError("حدث خطأ أثناء جلب التصنيفات", 500);
  }
}
