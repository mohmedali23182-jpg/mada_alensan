import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  const querySecret = new URL(request.url).searchParams.get("secret");
  return Boolean(cronSecret && (auth === `Bearer ${cronSecret}` || querySecret === cronSecret));
}

async function setWebhook(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (!token || !secret || !siteUrl) {
    return NextResponse.json({ ok: false, message: "Missing TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET or NEXT_PUBLIC_SITE_URL" }, { status: 400 });
  }

  const webhookUrl = `${siteUrl.replace(/\/$/, "")}/api/telegram/webhook`;
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message"],
      drop_pending_updates: false,
    }),
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json({ ok: res.ok && data?.ok !== false, webhookUrl, telegram: data }, { status: res.ok ? 200 : 500 });
}

export async function POST(request: Request) {
  return setWebhook(request);
}

export async function GET(request: Request) {
  return setWebhook(request);
}
