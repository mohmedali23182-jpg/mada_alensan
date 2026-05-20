import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postToArticle } from "@/lib/content";
import { jsonOk, jsonError } from "@/lib/http-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let page = parseInt(url.searchParams.get("page") || "1", 10);
  let limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const q = url.searchParams.get("q") || "";
  const categorySlug = url.searchParams.get("category") || "";
  const featured = url.searchParams.get("featured") === "true";

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 50) limit = 50;

  const skip = (page - 1) * limit;

  const where: any = {
    status: "PUBLISHED",
  };

  if (featured) {
    where.OR = [
      { featured: true },
      { isStoryOfDay: true }
    ];
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
    ];
  }

  try {
    const postInclude = {
      category: true,
      contributor: true,
      author: {
        select: { id: true, name: true, email: true, avatarUrl: true, role: true }
      },
      tags: { include: { tag: true } }
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: postInclude,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const items = posts.map((post: any) => postToArticle(post));
    const totalPages = Math.ceil(total / limit);

    return jsonOk({
      items,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("GET /api/v1/articles error:", error);
    return jsonError("حدث خطأ أثناء جلب المقالات", 500);
  }
}
