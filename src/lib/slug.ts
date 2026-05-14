export function makeSlug(input: string, fallbackPrefix = "post") {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || `${fallbackPrefix}-${Date.now()}`;
}
