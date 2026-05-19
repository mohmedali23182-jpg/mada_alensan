import { NextResponse } from "next/server";
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getTelegramSecret(request: Request) {
  return request.headers.get("x-telegram-bot-api-secret-token") || "";
}

function isValidTelegramSecret(request: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.warn("TELEGRAM_WEBHOOK_SECRET is not configured. Telegram webhook request was allowed temporarily.");
    return true;
  }

  const receivedSecret = getTelegramSecret(request);
  return receivedSecret === expectedSecret;
}

export async function GET() {
  return NextResponse.json({ ok: true, webhook: "telegram" });
}

export async function POST(request: Request) {
  if (!isValidTelegramSecret(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let update: TelegramUpdate | null = null;

  try {
    update = (await request.json()) as TelegramUpdate;
  } catch (error) {
    console.error("Telegram webhook received invalid JSON", error);
    return NextResponse.json({ ok: false, error: "Invalid Telegram payload" }, { status: 400 });
  }

  try {
    const result = await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Telegram webhook handler failed", error);

    // Telegram treats non-2xx responses as failed deliveries and keeps retrying.
    // Keep the response JSON and successful so one bad update does not block the webhook queue.
    return NextResponse.json({ ok: true, handled: false, error: "Telegram update handler failed" });
  }
}
