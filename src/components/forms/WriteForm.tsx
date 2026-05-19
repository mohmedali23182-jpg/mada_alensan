"use client";

import { useState } from "react";
import { Send, CheckCircle, Upload, AlertCircle } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";
type ApiResponse = { ok?: boolean; message?: string; errors?: Record<string, string | string[]> };

const fieldLabels: Record<string, string> = {
  fullName: "الاسم الكامل",
  email: "البريد الإلكتروني",
  phone: "رقم واتساب",
  summary: "نبذة الكاتب",
  title: "عنوان المقال",
  body: "نص المقال",
  socialUrl: "الرابط الاجتماعي",
};

async function readJsonSafely(response: Response): Promise<ApiResponse> {
  const text = await response.text();
  if (!text) return { ok: false, message: "رد غير صالح من الخادم" };
  try {
    return JSON.parse(text) as ApiResponse;
  } catch {
    return { ok: false, message: "رد غير صالح من الخادم" };
  }
}

function firstErrorMessage(data: ApiResponse) {
  if (data.message) return data.message;
  const errors = data.errors || {};
  const [field, value] = Object.entries(errors)[0] || [];
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "تعذر إرسال المقال";
  return field && fieldLabels[field] ? `${fieldLabels[field]}: ${raw}` : raw;
}

export default function WriteForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [publishWithName, setPublishWithName] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("loading");
    setMessage("");
    const formData = new FormData(form);
    formData.set("allowPublish", String(publishWithName));
    try {
      const res = await fetch("/api/submissions/article", { method: "POST", body: formData });
      const data = await readJsonSafely(res);
      if (!res.ok || !data.ok) throw new Error(firstErrorMessage(data));
      setState("success");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-white rounded-2xl shadow-card p-10 text-center">
        <div className="w-16 h-16 bg-hope/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-hope" />
        </div>
        <h3 className="text-xl font-bold font-cairo text-navy mb-3">تم استلام مقالك!</h3>
        <p className="text-text-light font-tajawal text-sm leading-relaxed">سيراجع فريق التحرير مقالك وسنتواصل معك قريبًا.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-7 md:p-9">
      <div className="mb-7">
        <h2 className="text-xl font-bold font-cairo text-navy mb-2">نموذج إرسال مقال</h2>
        <p className="text-text-muted text-sm font-tajawal">نرحب بأي مقال يلامس قضايا الناس، ويتسم بالموضوعية والأمانة.</p>
      </div>

      {state === "error" ? (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-urgent/10 p-4 text-sm font-bold text-urgent">
          <AlertCircle size={18} /> {message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-ivory rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold font-cairo text-navy border-b border-ivory-dark pb-2">معلومات الكاتب</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label-field">الاسم الكامل <span className="text-urgent">*</span></label><input name="fullName" type="text" className="input-field" minLength={2} required /></div>
            <div><label className="label-field">البريد الإلكتروني <span className="text-urgent">*</span></label><input name="email" type="email" className="input-field ltr" dir="ltr" required /></div>
          </div>
          <div><label className="label-field">رقم واتساب</label><input name="phone" type="tel" className="input-field ltr" dir="ltr" /></div>
          <div><label className="label-field">نبذة قصيرة عن الكاتب <span className="text-xs text-text-muted">اختيارية</span></label><textarea name="summary" className="textarea-field min-h-[80px]" rows={3} placeholder="اختياري. إذا كتبتها فلتكن 5 أحرف فأكثر." /></div>
          <div>
            <label className="label-field">صورة الكاتب <span className="text-xs text-text-muted">اختيارية</span></label>
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gold/40 transition-colors cursor-pointer focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
              <Upload size={18} className="text-gold mx-auto mb-1.5" />
              <p className="text-xs text-text-muted font-tajawal">اضغط لاختيار صورة شخصية، ولن نستخدم أي صورة وهمية إذا لم ترفع صورة.</p>
              <input name="avatar" type="file" className="sr-only" accept="image/*" />
            </label>
          </div>
          <div><label className="label-field">رابط اجتماعي</label><input name="socialUrl" type="url" className="input-field ltr text-xs" dir="ltr" placeholder="https://" /></div>
        </div>

        <div className="bg-ivory rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold font-cairo text-navy border-b border-ivory-dark pb-2">معلومات المقال</h3>
          <div><label className="label-field">عنوان المقال <span className="text-urgent">*</span></label><input name="title" type="text" className="input-field" minLength={5} required /></div>
          <div><label className="label-field">ملخص المقال</label><textarea name="excerpt" className="textarea-field min-h-[80px]" rows={3} /></div>
          <div><label className="label-field">نص المقال <span className="text-urgent">*</span></label><textarea name="body" className="textarea-field" required minLength={20} rows={12} /></div>
          <div>
            <label className="label-field">صورة غلاف <span className="text-xs text-text-muted">اختيارية - المقاس المثالي 1600×900</span></label>
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-gold/40 transition-colors cursor-pointer focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
              <Upload size={20} className="text-gold mx-auto mb-2" />
              <p className="text-sm text-text-muted font-tajawal">اضغط لاختيار صورة الغلاف بنسبة 16:9. إذا لم ترفع صورة لن نختار صورة وهمية.</p>
              <input name="coverImage" type="file" className="sr-only" accept="image/*" />
            </label>
          </div>
          <div>
            <label className="label-field">مرفقات إضافية</label>
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-gold/40 transition-colors cursor-pointer">
              <Upload size={20} className="text-gold mx-auto mb-2" />
              <p className="text-sm text-text-muted font-tajawal">صور، PDF، صوت أو فيديو</p>
              <input name="attachments" type="file" className="sr-only" multiple accept="image/*,.pdf,audio/*,video/*" />
            </label>
          </div>
        </div>

        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input name="allowPublish" type="checkbox" checked={publishWithName} onChange={(e) => setPublishWithName(e.target.checked)} className="mt-0.5 w-4 h-4 accent-gold" />
            <span className="text-sm font-semibold font-cairo text-navy">أريد نشر المقال باسمي الكامل</span>
          </label>
        </div>

        <button disabled={state === "loading"} type="submit" className="w-full btn-hope justify-center py-3.5 text-base disabled:opacity-60">
          <Send size={18} /> {state === "loading" ? "جارٍ الإرسال..." : "إرسال المقال"}
        </button>
      </form>
    </div>
  );
}
