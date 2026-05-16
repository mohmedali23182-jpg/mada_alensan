import "server-only";
import { prisma } from "@/lib/prisma";

type PushMessage = {
  title: string;
  body: string;
  type?: string;
  url?: string | null;
  imageUrl?: string | null;
};

function isEnabledForType(preference: { enableAll: boolean; newArticles: boolean; breakingNews: boolean; updates: boolean; systemMessages: boolean } | null | undefined, type = "SYSTEM") {
  if (!preference) return true;
  if (!preference.enableAll) return false;
  if (type === "NEW_ARTICLE") return preference.newArticles;
  if (type === "BREAKING_NEWS") return preference.breakingNews;
  if (type === "UPDATE") return preference.updates;
  return preference.systemMessages;
}

export async function selectPushTargets(type = "SYSTEM") {
  const devices = await prisma.pushDevice.findMany({ where: { enabled: true }, take: 1000 });
  const tokens = devices.map((device) => device.token);
  const preferences = tokens.length
    ? await prisma.notificationPreference.findMany({ where: { deviceToken: { in: tokens } } })
    : [];
  const preferenceMap = new Map(preferences.map((preference) => [preference.deviceToken, preference]));
  return devices.filter((device) => isEnabledForType(preferenceMap.get(device.token), type));
}

export async function sendPushNotificationToTokens(tokens: string[], message: PushMessage) {
  const serverKey = process.env.FIREBASE_SERVER_KEY;
  if (!serverKey) {
    return {
      configured: false,
      sentCount: 0,
      failedCount: 0,
      error: "FIREBASE_SERVER_KEY is not configured. Notification was saved but not delivered.",
    };
  }

  let sentCount = 0;
  let failedCount = 0;
  const invalidTokens: string[] = [];

  for (const token of tokens) {
    try {
      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${serverKey}`,
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: message.title,
            body: message.body,
            image: message.imageUrl || undefined,
          },
          data: {
            type: message.type || "SYSTEM",
            url: message.url || "",
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.success !== 0) {
        sentCount += 1;
      } else {
        failedCount += 1;
        const resultError = payload?.results?.[0]?.error;
        if (["InvalidRegistration", "NotRegistered"].includes(resultError)) invalidTokens.push(token);
      }
    } catch (error) {
      failedCount += 1;
      console.error("[push:fcm]", error);
    }
  }

  if (invalidTokens.length) {
    await prisma.pushDevice.updateMany({ where: { token: { in: invalidTokens } }, data: { enabled: false } }).catch(() => null);
  }

  return { configured: true, sentCount, failedCount, error: failedCount ? "Some push notifications failed." : null };
}
