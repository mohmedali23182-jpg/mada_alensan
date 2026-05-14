import "server-only";
import { prisma } from "@/lib/prisma";

export type NotificationPayload = {
  subject: string;
  title: string;
  lines: string[];
  entity?: string;
  entityId?: string;
};

const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "mtzallqmy@gmail.com";
const resendApiKey = process.env.RESEND_API_KEY || "";
const emailFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "Mada Alensan <onboarding@resend.dev>";
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || "";
const telegramAdminIds = (process.env.TELEGRAM_ADMIN_IDS || process.env.TELEGRAM_ADMIN_ID || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

function htmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function writeActivity(action: string, payload: NotificationPayload, metadata: Record<string, unknown>) {
  await prisma.activityLog.create({
    data: {
      action,
      entity: payload.entity,
      entityId: payload.entityId,
      metadata: {
        subject: payload.subject,
        title: payload.title,
        lines: payload.lines,
        ...metadata,
      },
    },
  }).catch(() => null);
}

async function sendTelegramAdminNotification(payload: NotificationPayload) {
  if (!telegramBotToken || telegramAdminIds.length === 0) {
    return { skipped: true, reason: "missing telegram env" };
  }

  const text = [`<b>${htmlEscape(payload.title)}</b>`, "", ...payload.lines.map(htmlEscape)].join("\n");
  const results = [];

  for (const chatId of telegramAdminIds) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      });
      const data = await res.json().catch(() => null);
      results.push({ chatId, ok: res.ok && data?.ok !== false, response: data });
    } catch (error) {
      results.push({ chatId, ok: false, error: error instanceof Error ? error.message : "unknown" });
    }
  }

  return { skipped: false, results };
}

async function sendEmailAdminNotification(payload: NotificationPayload) {
  if (!adminEmail || !resendApiKey) {
    return { skipped: true, reason: "missing email env" };
  }

  const text = [payload.title, "", ...payload.lines].join("\n");
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>${htmlEscape(payload.title)}</h2>${payload.lines.map((line) => `<p>${htmlEscape(line)}</p>`).join("")}</div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: emailFrom, to: [adminEmail], subject: payload.subject, text, html }),
  });

  const data = await res.json().catch(() => null);
  return { skipped: false, ok: res.ok && data?.error == null, response: data };
}

export async function notifyAdmin(payload: NotificationPayload) {
  const result: Record<string, unknown> = {};
  await writeActivity("notification.created", payload, { channel: "system" });

  const telegram = await sendTelegramAdminNotification(payload).catch((error) => ({ ok: false, error: error instanceof Error ? error.message : "Telegram failed" }));
  result.telegram = telegram;
  await writeActivity("notification.telegram.result", payload, { telegram });

  const email = await sendEmailAdminNotification(payload).catch((error) => ({ ok: false, error: error instanceof Error ? error.message : "Email failed" }));
  result.email = email;
  await writeActivity("notification.email.result", payload, { email });

  if ((telegram as any)?.skipped && (email as any)?.skipped) {
    console.warn("Admin notification skipped: Telegram and email env are missing");
  }

  return { ok: true, ...result };
}
