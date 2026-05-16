const ARABIC_STOP_WORDS = new Set([
  "في", "من", "على", "إلى", "عن", "أن", "إن", "كان", "كانت", "هذا", "هذه", "ذلك", "تلك", "هو", "هي", "هم", "كما", "كل", "بين", "بعد", "قبل", "مع", "غير", "أو", "و", "ثم", "حتى", "لا", "ما", "لم", "لن", "قد", "لقد", "وهو", "وهي", "التي", "الذي", "الذين", "الى"
]);

function stripHtml(input = "") {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(input = "") {
  return stripHtml(input)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[“”\"']/g, "")
    .trim();
}

function splitSentences(input = "") {
  const clean = normalizeText(input);
  return clean
    .split(/(?<=[.!؟؛…])\s+|\n+/g)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function smartSentenceScore(sentence: string) {
  const length = sentence.length;
  let score = 0;
  if (length >= 90 && length <= 220) score += 5;
  if (length >= 120 && length <= 180) score += 4;
  if (/[،؛]/.test(sentence)) score += 1;
  if (/(الإنسان|الناس|الفقر|المرض|النزوح|التعليم|العلاج|الحياة|الأسرة|الطفل|المعاناة|الكرامة|الأمل|الصوت|الرسالة)/.test(sentence)) score += 4;
  if (/^(قال|وأضاف|وأكد|وأشار|وتابع)/.test(sentence)) score += 2;
  if (/^(هذا|هذه|ذلك|كما|وقد|في|من|على)\b/.test(sentence)) score -= 2;
  if (length < 70) score -= 4;
  if (length > 260) score -= 3;
  return score;
}

export function extractSmartExcerpt(content = "", fallback = "") {
  const sentences = splitSentences(content);
  const best = sentences
    .filter((sentence) => sentence.length >= 70)
    .sort((a, b) => smartSentenceScore(b) - smartSentenceScore(a))[0];
  const source = best || normalizeText(fallback || content);
  if (!source) return "";
  if (source.length <= 190) return source;
  const cut = source.slice(0, 185);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 120 ? lastSpace : 185).trim()}…`;
}

export function extractFeaturedQuote(content = "") {
  const sentences = splitSentences(content);
  const best = sentences
    .filter((sentence) => sentence.length >= 60 && sentence.length <= 230)
    .sort((a, b) => smartSentenceScore(b) - smartSentenceScore(a))[0];
  return best || "";
}

export function calculateReadingTime(content = "") {
  const words = normalizeText(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function extractKeywords(title = "", content = "", categoryName = "") {
  const clean = normalizeText(`${title} ${categoryName} ${content}`);
  const words = clean
    .split(/\s+/)
    .map((word) => word.replace(/[.,،:؛!?؟()\[\]{}]/g, "").trim())
    .filter((word) => word.length >= 4 && !ARABIC_STOP_WORDS.has(word));
  const counts = new Map<string, number>();
  for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
  const keywords = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 10);
  const priority = [categoryName, "مدى الإنسان", "قصة إنسانية"].filter(Boolean);
  return [...new Set([...priority, ...keywords])].slice(0, 12);
}

export function extractGeoHints(content = "") {
  const clean = normalizeText(content);
  const known = [
    "تعز", "عدن", "صنعاء", "إب", "الحديدة", "حضرموت", "مأرب", "ذمار", "لحج", "أبين", "شبوة", "الضالع", "ريمة", "حجة", "صعدة", "المحويت", "عمران", "البيضاء", "المهرة", "سقطرى", "اليمن"
  ];
  const found = known.filter((place) => clean.includes(place));
  const city = found.find((place) => place !== "اليمن") || "";
  return {
    country: clean.includes("اليمن") || city ? "اليمن" : "",
    city,
    geoKeywords: [...new Set(found.length ? found : city ? [city, "اليمن"] : [])],
  };
}

export function generateSeoTitle(title = "", siteName = "مدى الإنسان") {
  const clean = normalizeText(title);
  if (!clean) return siteName;
  const suffix = ` | ${siteName}`;
  const max = 62 - suffix.length;
  const clipped = clean.length > max ? `${clean.slice(0, Math.max(20, max)).trim()}…` : clean;
  return clipped.includes(siteName) ? clipped : `${clipped}${suffix}`;
}

export function generateSeoDescription(content = "", excerpt = "") {
  const smart = extractSmartExcerpt(content, excerpt);
  if (!smart) return "منصة مدى الإنسان تنقل قصص الناس وقضاياهم بكرامة ومسؤولية.";
  if (smart.length <= 165) return smart;
  return `${smart.slice(0, 160).trim()}…`;
}

export function generateCanonicalUrl(siteUrl = "", slug = "") {
  const base = (siteUrl || "").replace(/\/$/, "");
  if (!base || !slug) return "";
  return `${base}/articles/${encodeURIComponent(slug)}`;
}

export function buildEditorialMetadata(input: {
  title: string;
  content: string;
  excerpt?: string;
  categoryName?: string;
  siteName?: string;
  siteUrl?: string;
  slug?: string;
}) {
  const excerpt = extractSmartExcerpt(input.content, input.excerpt || input.title);
  const featuredQuote = extractFeaturedQuote(input.content);
  const seoTitle = generateSeoTitle(input.title, input.siteName || "مدى الإنسان");
  const seoDescription = generateSeoDescription(input.content, excerpt);
  const keywords = extractKeywords(input.title, input.content, input.categoryName || "");
  const geo = extractGeoHints(input.content);
  return {
    excerpt,
    featuredQuote,
    seoTitle,
    seoDescription,
    seoKeywords: keywords,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    twitterTitle: seoTitle,
    twitterDescription: seoDescription,
    readingTime: calculateReadingTime(input.content),
    canonicalUrl: input.slug ? generateCanonicalUrl(input.siteUrl || "", input.slug) : "",
    ...geo,
  };
}
