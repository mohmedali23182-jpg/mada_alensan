import "server-only";
import { prisma } from "@/lib/prisma";

export type NotificationPayload = {
  subject: string;
  title: string;
  lines: string[];
  entity?: string;
  entityId?: string;
};

const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "";
const resendApiKey = process.env.RESEND_API_KEY || "";
const emailFrom = process.env.EMAIL_FROM || "Mada Al-Nas <onboarding@resend.dev>";

function htmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function notifyAdmin(payload: NotificationPayload) {
  const metadata = { subject: payload.subject, title: payload.title, lines: payload.lines, entity: payload.entity, entityId: payload.entityId };
  await prisma.activityLog.create({ data: { action: "notification.created", entity: payload.entity, entityId: payload.entityId, metadata } }).catch(() => null);

  if (!adminEmail || !resendApiKey) {
    console.warn("Admin email notification skipped: ADMIN_NOTIFICATION_EMAIL/ADMIN_EMAIL or RESEND_API_KEY is missing");
    return { skipped: true };
  }

  const text = [payload.title, "", ...payload.lines].join("\n");
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h2>${htmlEscape(payload.title)}</h2>${payload.lines.map((line) => `<p>${htmlEscape(line)}</p>`).join("")}</div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: emailFrom, to: [adminEmail], subject: payload.subject, text, html }),
  });

  const data = await res.json().catch(() => null);
  await prisma.activityLog.create({ data: { action: res.ok ? "notification.email.sent" : "notification.email.failed", entity: payload.entity, entityId: payload.entityId, metadata: { provider: "resend", response: data } } }).catch(() => null);
  if (!res.ok) return { skipped: false, ok: false, error: data?.message || "Email provider failed" };
  return { ok: true };
}
