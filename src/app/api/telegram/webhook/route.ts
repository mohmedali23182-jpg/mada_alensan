import { NextResponse } from "next/server";
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isValidSecret(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return false;
  const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
  const urlSecret = new URL(request.url).searchParams.get("secret");
  return headerSecret === expected || urlSecret === expected;
}

export async function POST(request: Request) {
  if (!isValidSecret(request)) {
    return NextResponse.json({ ok: false, message: "Invalid Telegram webhook secret" }, { status: 401 });
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  if (!update) return NextResponse.json({ ok: false, message: "Invalid Telegram payload" }, { status: 400 });

  try {
    const result = await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Telegram webhook error", error);
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Telegram webhook failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, name: "Madaalinsan Telegram webhook" });
}
