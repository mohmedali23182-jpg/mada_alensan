import "server-only";
import { createServiceSupabaseClient } from "./supabase";

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
const DEFAULT_BUCKET = "media";
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);


function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
}

async function ensureStorageBucket(supabase: ReturnType<typeof createServiceSupabaseClient>, bucket: string) {
  const { data, error } = await supabase.storage.getBucket(bucket);
  if (data && !error) return;

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: MAX_UPLOAD_SIZE,
    allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
  });

  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(`تعذر إنشاء مخزن الصور ${bucket}: ${createError.message}`);
  }
}

function cleanFolder(folder: string) {
  return folder.replace(/[^a-zA-Z0-9/_-]/g, "-").replace(/^\/+|\/+$/g, "") || "uploads";
}

function safeFilename(name: string) {
  const extension = name.includes(".") ? name.split(".").pop() : "file";
  const base = name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80) || "upload";
  return `${base}.${extension}`;
}

export function assertAllowedUpload(mimeType: string, sizeBytes: number) {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error("نوع الملف غير مسموح به");
  }
  if (sizeBytes > MAX_UPLOAD_SIZE) {
    throw new Error("حجم الملف أكبر من 50MB");
  }
}

export async function uploadToStorage(file: File, folder = "uploads") {
  assertAllowedUpload(file.type || "application/octet-stream", file.size);
  const bucket = getStorageBucket();
  const supabase = createServiceSupabaseClient();
  await ensureStorageBucket(supabase, bucket);
  const path = `${cleanFolder(folder)}/${Date.now()}-${crypto.randomUUID()}-${safeFilename(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl, filename: file.name, mimeType: file.type, sizeBytes: file.size };
}

export async function uploadBufferToStorage(buffer: Buffer, filename: string, mimeType = "application/octet-stream", folder = "uploads") {
  assertAllowedUpload(mimeType, buffer.length);
  const bucket = getStorageBucket();
  const supabase = createServiceSupabaseClient();
  await ensureStorageBucket(supabase, bucket);
  const path = `${cleanFolder(folder)}/${Date.now()}-${crypto.randomUUID()}-${safeFilename(filename)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, { contentType: mimeType, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl, filename, mimeType, sizeBytes: buffer.length };
}
