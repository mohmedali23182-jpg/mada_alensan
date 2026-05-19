"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Upload, AlertCircle } from "lucide-react";

const CASE_TYPES = ["حالة صحية", "أسرة محتاجة", "نزوح", "تعليم", "سكن", "مياه وخدمات", "طفل أو كبار سن", "أخرى"];
const URGENCY_LEVELS = [
  { value: "low", label: "عادي", color: "text-hope" },
  { value: "medium", label: "متوسط", color: "text-gold" },
  { value: "high", label: "عاجل", color: "text-urgent" },
];

type FormState = "idle" | "loading" | "success" | "error";

export default function ReportForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [urgency, setUrgency] = useState("medium");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setMessage("");
    const formData = new FormData(e.currentTarget);
    formData.set("urgencyLevel", urgency);
    try {
      const res = await fetch("/api/submissions/report", { method: "POST", body: formData });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message || "تعذر إرسال البلاغ");
      setState("success");
      e.currentTarget.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-white rounded-2xl shadow-card p-10 text-center">
        <div className="w-16 h-16 bg-urgent/10 rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle size={32} className="text-urgent" /></div>
        <h3 className="text-xl font-bold font-cairo text-navy mb-3">تم استلام البلاغ!</h3>
        <p className="text-text-light font-tajawal text-sm leading-relaxed">سيراجعه فريق المنصة قبل تحويله إلى قضية منشورة.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-7 md:p-9">
      <div className="mb-7"><h2 className="text-xl font-bold font-cairo text-navy mb-2">نموذج بلاغ عن حالة</h2><p className="text-text-muted text-sm font-tajawal">اكتب المعلومات المتاحة بدقة، وسنتعامل معها بمسؤولية.</p></div>
      {state === "error" ? <div className="mb-5 flex items-center gap-2 rounded-xl bg-urgent/10 p-4 text-sm font-bold text-urgent"><AlertCircle size={18} /> {message}</div> : null}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label-field">الاسم</label><input name="fullName" type="text" className="input-field" /></div>
          <div><label className="label-field">رقم التواصل</label><input name="phone" type="tel" className="input-field ltr" dir="ltr" /></div>
        </div>
        <div><label className="label-field">البريد الإلكتروني</label><input name="email" type="email" className="input-field ltr" dir="ltr" /></div>
        <div><label className="label-field">نوع الحالة</label><select name="caseType" className="input-field" defaultValue=""><option value="" disabled>اختر نوع الحالة</option>{CASE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></div>
        <div><label className="label-field">عنوان البلاغ <span className="text-urgent">*</span></label><input name="title" type="text" className="input-field" required /></div>
        <div><label className="label-field">المنطقة / المحافظة</label><input name="regionText" type="text" className="input-field" /></div>
        <div>
          <label className="label-field">مستوى العاجلية</label>
          <div className="grid grid-cols-3 gap-3">{URGENCY_LEVELS.map((level) => <label key={level.value} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 p-3 cursor-pointer hover:border-gold"><input type="radio" name="urgency" value={level.value} checked={urgency === level.value} onChange={(e) => setUrgency(e.target.value)} className="accent-gold" /><span className={`text-sm font-semibold font-cairo ${level.color}`}>{level.label}</span></label>)}</div>
        </div>
        <div><label className="label-field">وصف الحالة <span className="text-urgent">*</span></label><textarea name="body" className="textarea-field" required rows={7} /></div>
        <div>
          <label className="label-field">صور أو وثائق</label>
          <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-urgent/30 transition-colors cursor-pointer focus-within:border-urgent/40 focus-within:ring-2 focus-within:ring-urgent/20">
            <Upload size={22} className="text-urgent/60 mx-auto mb-2" />
            <p className="text-sm text-text-muted font-tajawal">اضغط لاختيار صور، وثائق، صوت أو فيديو</p>
            <input name="attachments" type="file" className="sr-only" multiple accept="image/*,.pdf,audio/*,video/*" />
          </label>
        </div>
        <button disabled={state === "loading"} type="submit" className="w-full btn-urgent justify-center py-3.5 text-base disabled:opacity-60"><AlertTriangle size={18} /> {state === "loading" ? "جارٍ الإرسال..." : "إرسال البلاغ"}</button>
      </form>
    </div>
  );
}
