import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBearerPermission } from "@/lib/api-token-auth";
import { categorySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { response } = await requireBearerPermission(request, "categories:manage");
  if (response) return response;
  const items = await prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const { response } = await requireBearerPermission(request, "categories:manage");
  if (response) return response;
  try {
    const body = await request.json().catch(() => null);
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, message: "بيانات القسم غير مكتملة", errors: parsed.error.flatten() }, { status: 400 });
    const item = await prisma.category.upsert({
      where: { slug: parsed.data.slug },
      update: parsed.data,
      create: parsed.data,
    });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("[api:v1:admin:categories]", error);
    return NextResponse.json({ ok: false, message: "تعذر حفظ القسم" }, { status: 500 });
  }
}
