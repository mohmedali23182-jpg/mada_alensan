import { NextResponse } from "next/server";
import { getArticleBySlugFromDb } from "@/lib/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const item = await getArticleBySlugFromDb(params.slug);
  if (!item) return NextResponse.json({ ok: false, message: "المقال غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true, item });
}
