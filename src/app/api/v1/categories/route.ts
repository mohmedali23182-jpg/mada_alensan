import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/http-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return jsonOk({ categories });
  } catch (error) {
    console.error("GET /api/v1/categories error:", error);
    return jsonError("حدث خطأ أثناء جلب التصنيفات", 500);
  }
}
