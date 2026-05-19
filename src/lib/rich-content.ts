import "server-only";

export type EditorBlock = {
  id?: string;
  type: "paragraph" | "heading" | "quote" | "image" | "divider";
  text?: string;
  level?: 2 | 3;
  url?: string;
  alt?: string;
  caption?: string;
};

const allowedTags = new Set(["p", "br", "strong", "b", "em", "i", "u", "a", "h2", "h3", "blockquote", "ul", "ol", "li", "figure", "figcaption", "img", "hr"]);
const allowedAttrs = new Set(["href", "src", "alt", "title", "target", "rel", "loading", "decoding", "class"]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const url = new URL(trimmed);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

export function blocksToHtml(blocks: EditorBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        const level = block.level === 3 ? 3 : 2;
        return `<h${level}>${escapeHtml(block.text || "")}</h${level}>`;
      }
      if (block.type === "quote") return `<blockquote>${escapeHtml(block.text || "")}</blockquote>`;
      if (block.type === "divider") return `<hr />`;
      if (block.type === "image") {
        const url = safeUrl(block.url);
        if (!url) return "";
        const alt = escapeHtml(block.alt || block.caption || "صورة المقال");
        const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : "";
        return `<figure><img src="${url}" alt="${alt}" loading="lazy" decoding="async" />${caption}</figure>`;
      }
      return `<p>${escapeHtml(block.text || "")}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

export function plainTextToHtml(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export function stripHtml(value = "") {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingTimeFromContent(content: string) {
  const words = stripHtml(content || content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function sanitizeRichHtml(input: string) {
  let html = String(input || "");
  html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
  html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/javascript:/gi, "");

  html = html.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (full, tag, attrs) => {
    const normalized = String(tag).toLowerCase();
    if (!allowedTags.has(normalized)) return "";
    if (full.startsWith("</")) return `</${normalized}>`;
    const safeAttrs: string[] = [];
    String(attrs || "").replace(/([a-z0-9-:]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi, (_m: string, attrName: string, _raw: string, d = "", s = "", bare = "") => {
      const attr = attrName.toLowerCase();
      const value = d || s || bare || "";
      if (!allowedAttrs.has(attr)) return "";
      if ((attr === "href" || attr === "src") && !safeUrl(value)) return "";
      safeAttrs.push(`${attr}="${escapeHtml(value)}"`);
      return "";
    });
    if (normalized === "a") {
      if (!safeAttrs.some((attr) => attr.startsWith("rel="))) safeAttrs.push('rel="noopener noreferrer"');
      if (!safeAttrs.some((attr) => attr.startsWith("target="))) safeAttrs.push('target="_blank"');
    }
    if (normalized === "img") {
      if (!safeAttrs.some((attr) => attr.startsWith("loading="))) safeAttrs.push('loading="lazy"');
      if (!safeAttrs.some((attr) => attr.startsWith("decoding="))) safeAttrs.push('decoding="async"');
    }
    const slash = full.endsWith("/>") || ["br", "img", "hr"].includes(normalized) ? " /" : "";
    return `<${normalized}${safeAttrs.length ? ` ${safeAttrs.join(" ")}` : ""}${slash}>`;
  });

  return html.trim();
}
