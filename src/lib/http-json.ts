import { NextResponse } from "next/server";

export async function readJsonSafe(request: Request) {
  try {
    const text = await request.text();
    if (!text || text.trim() === "") return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function jsonOk(data: any) {
  return NextResponse.json({ ok: true, ...data }, { status: 200 });
}

export function jsonError(message: string, status = 400, errors?: any) {
  return NextResponse.json({ ok: false, message, errors }, { status });
}
