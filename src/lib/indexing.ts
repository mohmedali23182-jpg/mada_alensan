import "server-only";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

export type IndexingResult = {
  provider: "indexnow" | "google";
  ok: boolean;
  status?: number;
  message?: string;
};

function shouldIndex() {
  return Boolean(SITE_URL && process.env.SEARCH_INDEXING_ENABLED === "true");
}

function normalizeUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function withTimeout(ms = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, done: () => clearTimeout(timer) };
}

export function indexNowKeyLocation() {
  const key = process.env.INDEXNOW_KEY || "";
  return key && SITE_URL ? `${SITE_URL}/${key}.txt` : "";
}

export async function submitToIndexNow(urls: string[]): Promise<IndexingResult> {
  if (!shouldIndex()) return { provider: "indexnow", ok: false, message: "SEARCH_INDEXING_ENABLED is not true" };
  const key = process.env.INDEXNOW_KEY;
  if (!key) return { provider: "indexnow", ok: false, message: "INDEXNOW_KEY is missing" };
  const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
  const urlList = [...new Set(urls.map(normalizeUrl).filter(Boolean))].slice(0, 100);
  if (!urlList.length) return { provider: "indexnow", ok: false, message: "No URLs" };

  const host = new URL(SITE_URL).host;
  const { controller, done } = withTimeout();
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: indexNowKeyLocation(), urlList }),
      signal: controller.signal,
    });
    const text = await res.text().catch(() => "");
    return { provider: "indexnow", ok: res.ok || res.status === 202, status: res.status, message: text || res.statusText };
  } catch (error) {
    return { provider: "indexnow", ok: false, message: error instanceof Error ? error.message : "IndexNow failed" };
  } finally {
    done();
  }
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getGoogleAccessToken() {
  const raw = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  const credentials = JSON.parse(raw) as { client_email: string; private_key: string; token_uri?: string };
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: credentials.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const { createSign } = await import("crypto");
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(credentials.private_key);
  const assertion = `${unsigned}.${base64Url(signature)}`;
  const res = await fetch(credentials.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) throw new Error(data?.error_description || "Google OAuth token failed");
  return String(data.access_token);
}

export async function submitToGoogleIndexing(url: string, type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"): Promise<IndexingResult> {
  if (!shouldIndex()) return { provider: "google", ok: false, message: "SEARCH_INDEXING_ENABLED is not true" };
  if (process.env.GOOGLE_INDEXING_ENABLED !== "true") return { provider: "google", ok: false, message: "GOOGLE_INDEXING_ENABLED is not true" };
  const target = normalizeUrl(url);
  if (!target) return { provider: "google", ok: false, message: "No URL" };
  const { controller, done } = withTimeout();
  try {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) return { provider: "google", ok: false, message: "GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON is missing" };
    const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: target, type }),
      signal: controller.signal,
    });
    const data = await res.text().catch(() => "");
    return { provider: "google", ok: res.ok, status: res.status, message: data || res.statusText };
  } catch (error) {
    return { provider: "google", ok: false, message: error instanceof Error ? error.message : "Google Indexing failed" };
  } finally {
    done();
  }
}

export async function submitUrlsForIndexing(urls: string[]) {
  const unique = [...new Set(urls.map(normalizeUrl).filter(Boolean))];
  const results: IndexingResult[] = [];
  results.push(await submitToIndexNow(unique));
  if (unique[0]) results.push(await submitToGoogleIndexing(unique[0]));
  return results;
}
