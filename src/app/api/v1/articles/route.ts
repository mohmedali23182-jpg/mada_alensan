import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postToArticle } from "@/lib/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const postInclude = {
  category: true,
  contributor: true,
  author: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
  tags: { include: { tag: true } },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));
    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "").trim();

    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        visibility: "PUBLIC",
        ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }] } : {}),
        ...(category ? { category: { slug: category } } : {}),
      },
      include: postInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({ ok: true, items: posts.map((post: any) => postToArticle(post)), meta: { limit, q, category, surface: "public-api-v1" } });
  } catch (error) {
    console.error("[api:v1:articles]", error);
    return NextResponse.json({ ok: false, message: "تعذر تحميل المقالات" }, { status: 500 });
  }
}
