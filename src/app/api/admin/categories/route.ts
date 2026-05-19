import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { categorySchema } from "@/lib/validators";
import { makeSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function revalidateCategorySurfaces(slug?: string) {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  if (slug) revalidatePath(`/categories/${slug}`);
}

export async function GET() {
  const { response } = await requirePermission("categories:manage");
  if (response) return response;
  const items = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const { response } = await requirePermission("categories:manage");
  if (response) return response;
  const body = await request.json().catch(() => null) || {};
  const parsed = categorySchema.safeParse({ ...body, slug: body.slug || makeSlug(body.name || "category") });
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.category.upsert({
    where: { slug: parsed.data.slug },
    update: parsed.data,
    create: parsed.data,
  });
  revalidateCategorySurfaces(item.slug);
  return NextResponse.json({ ok: true, item });
}

export async function PATCH(request: Request) {
  const { response } = await requirePermission("categories:manage");
  if (response) return response;
  const body = await request.json().catch(() => null) || {};
  if (!body.id) return NextResponse.json({ ok: false, message: "id مطلوب" }, { status: 400 });
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.category.update({ where: { id: body.id }, data: parsed.data });
  revalidateCategorySurfaces(item.slug);
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(request: Request) {
  const { response } = await requirePermission("categories:manage");
  if (response) return response;
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ ok: false, message: "id مطلوب" }, { status: 400 });
  const count = await prisma.post.count({ where: { categoryId: body.id } });
  if (count > 0) {
    const item = await prisma.category.update({ where: { id: body.id }, data: { isActive: false } });
    revalidateCategorySurfaces(item.slug);
    return NextResponse.json({ ok: true, item, archived: true, message: "تم تعطيل القسم لأنه مرتبط بمقالات" });
  }
  await prisma.category.delete({ where: { id: body.id } });
  revalidateCategorySurfaces();
  return NextResponse.json({ ok: true });
}
