import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(_request: Request, { params }: { params: { indexNowKey: string } }) {
  const key = process.env.INDEXNOW_KEY || "";
  if (!key || params.indexNowKey !== `${key}.txt`) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(key, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
