import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

const cookieName = process.env.SESSION_COOKIE_NAME || "mada_session";
const secret = process.env.AUTH_SECRET || "dev-secret-change-me";

type SessionPayload = {
  userId: string;
  email: string;
  role: string;
  exp: number;
};

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const body = base64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds }));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token?: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = sign(body);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const token = cookies().get(cookieName)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, isActive: true },
    });
    if (!user?.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().delete(cookieName);
}
