import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { uploadBufferToStorage } from "./storage";
import { sanitizeRichHtml, plainTextToHtml, stripHtml, readingTimeFromContent } from "./rich-content";
import { submitUrlsForIndexing } from "./indexing";

type TelegramUser = { id: number; first_name?: string; username?: string };
type TelegramPhoto = { file_id: string; file_unique_id: string; width: number; height: number; file_size?: number };
type TelegramMessage = { message_id: number; chat: { id: number; type: string }; from?: TelegramUser; text?: string; caption?: string; photo?: TelegramPhoto[] };
type TelegramCallbackQuery = { id: string; from: TelegramUser; message?: TelegramMessage; data?: string };
export type TelegramUpdate = { update_id: number; message?: TelegramMessage; callback_query?: TelegramCallbackQuery };

type DraftData = { title?: string; excerpt?: string; content?: string; authorName?: string; contributorId?: string; coverImage?: string; categoryId?: string; categoryName?: string; scheduledAt?: string | null };

const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
const channelId = process.env.TELEGRAM_ARTICLES_CHANNEL_ID || process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_CACHE_CHANNEL_ID || "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function telegramApi(method: string) {
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is missing");
  return `https://api.telegram.org/bot${botToken}/${method}`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getText(message: TelegramMessage) {
  return (message.text || message.caption || "").trim();
}

export function isAllowedTelegramAdmin(id?: number | string) {
  const admins = (process.env.TELEGRAM_ADMIN_IDS || "").split(",").map((v) => v.trim()).filter(Boolean);
  return Boolean(id && admins.includes(String(id)));
}

export async function sendTelegramMessage(chatId: string | number, text: string, options?: Record<string, unknown>) {
  const res = await fetch(telegramApi("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: false, ...options }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.ok === false) throw new Error(data?.description || "Telegram sendMessage failed");
  return data;
}

async function answerCallbackQuery(callbackQueryId: string, text = "تم") {
  const res = await fetch(telegramApi("answerCallbackQuery"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: false }),
  });
  return res.json().catch(() => null);
}

async function sendTelegramPhoto(chatId: string | number, photo: string, caption: string, options?: Record<string, unknown>) {
  const res = await fetch(telegramApi("sendPhoto"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, photo, caption, parse_mode: "HTML", ...options }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data?.ok === false) throw new Error(data?.description || "Telegram sendPhoto failed");
  return data;
}

async function getTelegramFileUrl(fileId: string) {
  const res = await fetch(telegramApi("getFile"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file_id: fileId }) });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok || !data.result?.file_path) throw new Error(data?.description || "Telegram getFile failed");
  return `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
}

export function makeSlug(input: string) {
  return input.trim().toLowerCase().replace(/[\u064B-\u065F]/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `post-${Date.now()}`;
}

async function uniquePostSlug(input: string) {
  const base = makeSlug(input);
  let slug = base;
  let counter = 2;
  while (await prisma.post.findUnique({ where: { slug }, select: { id: true } })) slug = `${base}-${counter++}`;
  return slug;
}

function parseSchedule(text: string) {
  const value = text.trim();
  if (["الآن", "انشر", "نشر", "now", "publish"].includes(value.toLowerCase())) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!match) throw new Error("اكتب الموعد بصيغة 2026-05-13 18:30 أو اكتب: الآن");
  const [, y, m, d, hh, mm] = match;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh) - 3, Number(mm))).toISOString();
}

async function upsertDraft(chatId: string, step: string, data: DraftData) {
  return prisma.telegramDraft.upsert({ where: { chatId }, update: { step: step as never, data: data as never }, create: { chatId, step: step as never, data: data as never } });
}

async function getDraft(chatId: string) {
  const draft = await prisma.telegramDraft.findUnique({ where: { chatId } });
  return { step: draft?.step || "IDLE", data: (draft?.data || {}) as DraftData };
}

async function resetDraft(chatId: string) {
  await prisma.telegramDraft.deleteMany({ where: { chatId } });
}

async function uploadTelegramPhoto(message: TelegramMessage) {
  const best = message.photo?.slice().sort((a, b) => (b.file_size || 0) - (a.file_size || 0))[0];
  if (!best) return null;
  const fileUrl = await getTelegramFileUrl(best.file_id);
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error("تعذر تنزيل الصورة من تليجرام");
  const arrayBuffer = await response.arrayBuffer();
  const uploaded = await uploadBufferToStorage(Buffer.from(arrayBuffer), `telegram-${Date.now()}.jpg`, "image/jpeg", "telegram-covers");
  return uploaded.url;
}

async function ensureContributor(name?: string) {
  if (!name) return null;
  const slug = makeSlug(name);
  return prisma.contributor.upsert({ where: { slug }, update: { name, isActive: true }, create: { name, slug, isActive: true } });
}

async function defaultCategory() {
  const first = await prisma.category.findFirst({ where: { isActive: true }, orderBy: { order: "asc" } });
  if (first) return first;
  return prisma.category.create({ data: { name: "أقلام الناس", slug: "opinions", color: "#2F8F6B", icon: "PenTool", isActive: true } });
}

async function afterTelegramPostPublished(slug: string) {
  revalidatePath("/");
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  await submitUrlsForIndexing([`${siteUrl.replace(/\/$/, "")}/articles/${slug}`]).catch(() => null);
}

async function publishDraft(chatId: string, data: DraftData) {
  if (!data.title || !data.content) throw new Error("المسودة ناقصة: العنوان أو المقال غير موجود.");
  const contributor = await ensureContributor(data.authorName);
  const category = data.categoryId ? await prisma.category.findUnique({ where: { id: data.categoryId } }) : await defaultCategory();
  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
  const shouldPublishNow = !scheduledAt || scheduledAt.getTime() <= Date.now();
  const content = sanitizeRichHtml(data.content.includes("<") ? data.content : plainTextToHtml(data.content));
  const plain = stripHtml(content);
  const slug = await uniquePostSlug(data.title);
  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || plain.slice(0, 220),
      content,
      coverImage: data.coverImage,
      thumbnail: data.coverImage,
      type: "CONTRIBUTOR_ARTICLE",
      status: shouldPublishNow ? "PUBLISHED" : "SCHEDULED",
      publishedAt: shouldPublishNow ? new Date() : null,
      scheduledAt,
      contributorId: contributor?.id,
      categoryId: category?.id,
      readingTime: readingTimeFromContent(content),
      seoTitle: data.title,
      seoDescription: data.excerpt || plain.slice(0, 160),
      ogTitle: data.title,
      ogDescription: data.excerpt || plain.slice(0, 160),
      ogImage: data.coverImage,
      twitterTitle: data.title,
      twitterDescription: data.excerpt || plain.slice(0, 160),
      twitterImage: data.coverImage,
      canonicalUrl: `${siteUrl.replace(/\/$/, "")}/articles/${slug}`,
    },
  });
  if (shouldPublishNow) {
    await afterTelegramPostPublished(post.slug);
    await publishPostToTelegramChannel(post.id);
  }
  await resetDraft(chatId);
  return post;
}

export async function publishPostToTelegramChannel(postId: string) {
  if (!channelId) return { skipped: true, reason: "TELEGRAM_CHANNEL_ID is missing" };
  const post = await prisma.post.findUnique({ where: { id: postId }, include: { contributor: true, category: true } });
  if (!post || post.status !== "PUBLISHED") return { skipped: true, reason: "post not publishable" };
  const alreadySent = await prisma.telegramPublishLog.findFirst({ where: { postId, status: "sent" }, select: { id: true, messageId: true } });
  if (alreadySent) return { skipped: true, reason: "already sent to Telegram", messageId: alreadySent.messageId };
  const baseUrl = siteUrl.replace(/\/$/, "");
  const url = `${baseUrl}/articles/${post.slug}`;
  const editUrl = `${baseUrl}/admin/articles?post=${post.id}`;
  const caption = [`📰 <b>${escapeHtml(post.title)}</b>`, post.excerpt ? `\n${escapeHtml(post.excerpt)}` : "", post.contributor?.name ? `\n✍️ ${escapeHtml(post.contributor.name)}` : "\n✍️ فريق التحرير", post.category?.name ? `\n🏷️ ${escapeHtml(post.category.name)}` : "", `\n🔗 الرابط الرسمي: ${url}`].join("");
  const keyboard = { inline_keyboard: [[{ text: "تصفح المقال", url }, { text: "رابط التعديل", url: editUrl }], [{ text: "إخفاء", callback_data: `post:ARCHIVED:${post.id}` }, { text: "مسودة", callback_data: `post:DRAFT:${post.id}` }]] };
  try {
    const result = post.coverImage ? await sendTelegramPhoto(channelId, post.coverImage, caption, { reply_markup: keyboard }) : await sendTelegramMessage(channelId, caption, { reply_markup: keyboard });
    const messageId = String(result?.result?.message_id || "");
    await prisma.telegramPublishLog.create({ data: { postId, channelId, messageId, status: "sent" } });
    return { ok: true, messageId };
  } catch (error) {
    await prisma.telegramPublishLog.create({ data: { postId, channelId, status: "failed", error: error instanceof Error ? error.message : "unknown" } });
    throw error;
  }
}

async function showCategories(chatId: string) {
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: [{ order: "asc" }, { name: "asc" }], take: 20 });
  const list = categories.map((c: any, i: number) => `${i + 1}. ${c.name}`).join("\n") || "لا توجد أقسام، اكتب أي اسم وسأنشئه.";
  await sendTelegramMessage(chatId, `اختر التصنيف بإرسال رقمه أو اسمه:\n\n${list}`);
}

function parseQuickPost(text: string) {
  const cleaned = text.replace(/^\/quickpost\s*/i, "").trim();
  const [titleLine, ...bodyLines] = cleaned.split("\n").map((line) => line.trim()).filter(Boolean);
  if (!titleLine || bodyLines.join("\n").length < 20) return null;
  return { title: titleLine.replace(/^#\s*/, ""), content: bodyLines.join("\n\n") };
}

async function createQuickPost(chatId: string, text: string) {
  const parsed = parseQuickPost(text);
  if (!parsed) {
    await sendTelegramMessage(chatId, "صيغة النشر السريع:\n/quickpost عنوان المقال\n\nنص المقال الطويل...");
    return { ok: false };
  }
  const category = await defaultCategory();
  const content = sanitizeRichHtml(plainTextToHtml(parsed.content));
  const post = await prisma.post.create({
    data: {
      title: parsed.title,
      slug: await uniquePostSlug(parsed.title),
      excerpt: stripHtml(content).slice(0, 220),
      content,
      type: "CONTRIBUTOR_ARTICLE",
      status: "DRAFT",
      categoryId: category.id,
      readingTime: readingTimeFromContent(content),
      seoTitle: parsed.title,
      seoDescription: stripHtml(content).slice(0, 160),
    },
  });
  await sendTelegramMessage(chatId, `تم إنشاء مسودة سريعة: ${escapeHtml(post.title)}`, { reply_markup: { inline_keyboard: [[{ text: "نشر الآن", callback_data: `post:PUBLISHED:${post.id}` }, { text: "حذف", callback_data: `post:DELETE:${post.id}` }]] } });
  return { ok: true, postId: post.id };
}

async function handleCallback(query: TelegramCallbackQuery) {
  const fromId = query.from?.id;
  const chatId = query.message?.chat.id;
  if (!isAllowedTelegramAdmin(fromId) || !chatId) return { ok: false, status: 403 };
  const data = query.data || "";
  if (data.startsWith("post:")) {
    const [, action, postId] = data.split(":");
    if (!postId) return { ok: false };
    if (action === "DELETE") {
      await prisma.post.delete({ where: { id: postId } });
      await answerCallbackQuery(query.id, "تم حذف المقال");
      await sendTelegramMessage(chatId, "تم حذف المقال.");
      return { ok: true };
    }
    const post = await prisma.post.update({ where: { id: postId }, data: { status: action as never, publishedAt: action === "PUBLISHED" ? new Date() : null } });
    if (post.status === "PUBLISHED") {
      await afterTelegramPostPublished(post.slug);
      await publishPostToTelegramChannel(post.id).catch(() => null);
    }
    await answerCallbackQuery(query.id, "تم تحديث الحالة");
    await sendTelegramMessage(chatId, `تم تحديث حالة المقال إلى: ${post.status}\n${siteUrl.replace(/\/$/, "")}/articles/${post.slug}`);
    return { ok: true };
  }
  if (data.startsWith("setting:")) {
    const [, key, value] = data.split(":");
    if (!key) return { ok: false };
    await prisma.siteSetting.upsert({ where: { key }, update: { value: value === "on" }, create: { key, value: value === "on" } });
    await answerCallbackQuery(query.id, "تم حفظ الإعداد");
    await sendTelegramMessage(chatId, `تم تحديث الإعداد: ${escapeHtml(key)}`);
    return { ok: true };
  }
  return { ok: true };
}

async function showSettings(chatId: string) {
  await sendTelegramMessage(chatId, "إعدادات سريعة:", { reply_markup: { inline_keyboard: [[{ text: "تفعيل النشر الآلي من الإدارة", callback_data: "setting:telegramAutoPublish:on" }, { text: "تعطيل", callback_data: "setting:telegramAutoPublish:off" }]] } });
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.callback_query) return handleCallback(update.callback_query);
  const message = update.message;
  if (!message) return { ok: true };
  const chatId = String(message.chat.id);
  const fromId = message.from?.id;
  if (!isAllowedTelegramAdmin(fromId)) {
    await sendTelegramMessage(chatId, "غير مصرح لهذا الحساب بإدارة المنصة.");
    return { ok: false, status: 403 };
  }

  const text = getText(message);
  if (["/start", "/help"].includes(text)) {
    await sendTelegramMessage(chatId, "أهلًا بك في بوت إدارة مدى الإنسان.\n\nالأوامر:\n/newpost إنشاء مقال خطوة بخطوة\n/quickpost عنوان ثم نص طويل لإنشاء مسودة فورية\n/settings إعدادات سريعة\n/status عرض المسودة\n/cancel إلغاء المسودة\n/topics اقتراح مواضيع");
    return { ok: true };
  }
  if (text === "/settings") return showSettings(chatId);
  if (text === "/cancel") { await resetDraft(chatId); await sendTelegramMessage(chatId, "تم إلغاء المسودة الحالية."); return { ok: true }; }
  if (text === "/topics") { await sendTelegramMessage(chatId, "اقتراحات مواضيع:\n1. يوميات أسرة بين المرض والفقر\n2. رسالة من قرية منسية\n3. طالب يواصل التعليم رغم النزوح\n4. ملف: علاج لا يصل إلى مستحقيه\n5. قصة كفاح أم تعيل أسرتها"); return { ok: true }; }
  if (text.startsWith("/quickpost")) return createQuickPost(chatId, text);
  if (text === "/newpost") { await upsertDraft(chatId, "TITLE", {}); await sendTelegramMessage(chatId, "لنبدأ مقالًا جديدًا.\nأرسل عنوان المقال."); return { ok: true }; }

  const draft = await getDraft(chatId);
  const data = draft.data;
  if (text === "/status") { await sendTelegramMessage(chatId, `حالة المسودة: ${draft.step}\nالعنوان: ${data.title || "-"}\nالكاتب: ${data.authorName || "-"}\nالتصنيف: ${data.categoryName || data.categoryId || "-"}`); return { ok: true }; }

  if (draft.step === "TITLE") { await upsertDraft(chatId, "EXCERPT", { ...data, title: text }); await sendTelegramMessage(chatId, "أرسل المقتطف المختصر للمقال."); return { ok: true }; }
  if (draft.step === "EXCERPT") { await upsertDraft(chatId, "CONTENT", { ...data, excerpt: text }); await sendTelegramMessage(chatId, "أرسل نص المقال كاملًا. يمكن أن يكون نصاً عادياً أو HTML بسيطاً."); return { ok: true }; }
  if (draft.step === "CONTENT") { await upsertDraft(chatId, "AUTHOR", { ...data, content: text }); await sendTelegramMessage(chatId, "أرسل اسم الكاتب، أو اكتب: تخطي ليظهر باسم فريق التحرير."); return { ok: true }; }
  if (draft.step === "AUTHOR") { const authorName = ["تخطي", "skip", "بدون"].includes(text.toLowerCase()) ? undefined : text; await upsertDraft(chatId, "COVER", { ...data, authorName }); await sendTelegramMessage(chatId, "أرسل صورة الغلاف كصورة، أو أرسل رابط صورة، أو اكتب: تخطي"); return { ok: true }; }
  if (draft.step === "COVER") {
    let coverImage: string | undefined = data.coverImage ?? undefined;
    if (message.photo?.length) coverImage = await uploadTelegramPhoto(message) || coverImage;
    else if (text && text !== "تخطي" && text.toLowerCase() !== "skip") coverImage = text;
    await upsertDraft(chatId, "CATEGORY", { ...data, coverImage });
    await showCategories(chatId);
    return { ok: true };
  }
  if (draft.step === "CATEGORY") {
    const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: [{ order: "asc" }, { name: "asc" }] });
    const index = Number(text) - 1;
    let category = Number.isInteger(index) && categories[index] ? categories[index] : categories.find((c: any) => c.name.trim() === text.trim());
    if (!category && text) category = await prisma.category.create({ data: { name: text.trim(), slug: `${makeSlug(text)}-${Date.now().toString(36)}`, isActive: true } });
    await upsertDraft(chatId, "SCHEDULE", { ...data, categoryId: category?.id, categoryName: category?.name });
    await sendTelegramMessage(chatId, "متى ننشر؟\nاكتب: الآن\nأو موعد مكة بصيغة: 2026-05-13 18:30");
    return { ok: true };
  }
  if (draft.step === "SCHEDULE") {
    const scheduledAt = parseSchedule(text);
    await upsertDraft(chatId, "CONFIRM", { ...data, scheduledAt });
    await sendTelegramMessage(chatId, `راجع المسودة:\n\nالعنوان: ${data.title}\nالكاتب: ${data.authorName || "فريق التحرير"}\nالتصنيف: ${data.categoryName || "-"}\nالنشر: ${scheduledAt ? `مجدول ${text} بتوقيت مكة` : "الآن"}\n\nاكتب: تأكيد\nأو /cancel للإلغاء`);
    return { ok: true };
  }
  if (draft.step === "CONFIRM") {
    if (!["تأكيد", "confirm", "نعم"].includes(text.toLowerCase())) { await sendTelegramMessage(chatId, "اكتب: تأكيد للنشر أو /cancel للإلغاء."); return { ok: true }; }
    const post = await publishDraft(chatId, data);
    await sendTelegramMessage(chatId, post.status === "PUBLISHED" ? `تم نشر المقال.
الرابط الرسمي: ${siteUrl}/articles/${post.slug}
رابط التعديل: ${siteUrl}/admin/articles?post=${post.id}` : `تمت جدولة المقال للنشر لاحقًا: ${post.title}`);
    return { ok: true };
  }
  await sendTelegramMessage(chatId, "اكتب /newpost لإنشاء مقال جديد أو /quickpost للنشر السريع أو /help للأوامر.");
  return { ok: true };
}
