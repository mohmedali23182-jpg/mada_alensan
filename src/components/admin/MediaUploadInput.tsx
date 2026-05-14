"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { UploadCloud, X } from "lucide-react";

type Props = {
  name: string;
  label: string;
  folder?: string;
  defaultValue?: string | null;
  accept?: string;
  hint?: string;
};

export function MediaUploadInput({
  name,
  label,
  folder = "admin-media",
  defaultValue,
  accept = "image/*,video/mp4,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  hint = "اختر ملفًا من الهاتف أو الكمبيوتر، أو الصق رابطًا مباشرًا.",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");

    if (file.size > 50 * 1024 * 1024) {
      setMessage("حجم الملف أكبر من 50MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      setUploading(true);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.message || "فشل رفع الملف");
      setValue(data.media.url);
      setMessage("تم رفع الملف بنجاح");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فشل رفع الملف");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2 rounded-2xl bg-white p-3 ring-1 ring-navy/10">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-black text-navy">{label}</span>
        {value ? (
          <button type="button" onClick={() => setValue("")} className="rounded-full bg-urgent/10 p-1 text-urgent" aria-label="حذف الرابط">
            <X size={15} />
          </button>
        ) : null}
      </div>
      <input type="hidden" name={name} value={value} />
      <label className="flex min-h-[108px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy/15 bg-ivory-light px-3 py-4 text-center transition hover:border-hope hover:bg-hope/5">
        <UploadCloud className="mb-2 text-hope" size={26} />
        <span className="text-sm font-bold">{uploading ? "جاري الرفع..." : "اضغط لاختيار ملف"}</span>
        <span className="mt-1 text-xs text-navy/50">{hint}</span>
        <input ref={inputRef} type="file" accept={accept} onChange={onFileChange} className="sr-only" disabled={uploading} />
      </label>
      <input
        dir="ltr"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="أو الصق رابط الملف هنا"
        className="input-field text-xs"
      />
      {message ? <p className={`text-xs font-bold ${message.includes("نجاح") ? "text-hope" : "text-urgent"}`}>{message}</p> : null}
      {value ? <a href={value} target="_blank" rel="noreferrer" className="block truncate text-xs font-bold text-teal">معاينة الملف</a> : null}
    </div>
  );
}
