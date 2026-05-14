import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getWebhookInfo() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.ok === false) return { ok: false, description: data?.description || "Telegram request failed" };
    return { ok: true, url: data?.result?.url || "", pending_update_count: data?.result?.pending_update_count || 0, last_error_message: data?.result?.last_error_message || null };
  } catch (error) {
    return { ok: false, description: error instanceof Error ? error.message : "Webhook status failed" };
  }
}

export async function GET() {
  const required = [
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_ADMIN_IDS",
    "TELEGRAM_CHANNEL_ID",
    "TELEGRAM_WEBHOOK_SECRET",
    "CRON_SECRET",
    "NEXT_PUBLIC_SITE_URL",
  ];

  return NextResponse.json({
    ok: true,
    telegram: Object.fromEntries(required.map((key) => [key, Boolean(process.env[key])])),
    timezone: process.env.APP_TIMEZONE || "Asia/Riyadh",
    webhook: await getWebhookInfo(),
  });
}
