import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postToArticle } from "@/lib/content";
import { jsonOk, jsonError } from "@/lib/http-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  if (!slug) {
    return jsonError("المعرف غير صالح", 400);
  }

  const decodedSlug = decodeURIComponent(slug).trim();

  try {
    const postInclude = {
      category: true,
      contributor: true,
      author: {
        select: { id: true, name: true, email: true, avatarUrl: true, role: true }
      },
      tags: { include: { tag: true } }
    };

    const post = await prisma.post.findFirst({
      where: {
        slug: decodedSlug,
        status: "PUBLISHED",
      },
      include: postInclude,
    });

    if (!post) {
      return jsonError("المقال غير موجود", 404);
    }

    return jsonOk({
      article: postToArticle(post as any),
    });
  } catch (error) {
    console.error("GET /api/v1/articles/[slug] error:", error);
    return jsonError("حدث خطأ أثناء جلب المقال", 500);
  }
}
