"use client";

import { useState } from "react";
import { Send, CheckCircle, Eye, EyeOff, Upload, AlertCircle } from "lucide-react";
import { readJsonResponse } from "@/lib/http-json";

const STORY_TYPES = ["قصة شخصية", "قصة عائلة", "قضية صحية", "قضية تعليمية", "نزوح أو تهجير", "فقر ومعاناة", "كفاح وصمود", "حالة عاجلة", "أخرى"];

type FormState = "idle" | "loading" | "success" | "error";

export default function SendStoryForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowPublish, setAllowPublish] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setMessage("");
    const formData = new FormData(e.currentTarget);
    formData.set("isAnonymous", String(isAnonymous));
    formData.set("allowPublish", String(allowPublish));
    try {
      const res = await fetch("/api/submissions/story", { method: "POST", body: formData });
      const data = await readJsonResponse(res);
      if (!res.ok || !data.ok) throw new Error(data.message || "تعذر إرسال القصة");
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
        <div className="w-16 h-16 bg-hope/10 rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle size={32} className="text-hope" /></div>
        <h3 className="text-xl font-bold font-cairo text-navy mb-3">تم استلام قصتك!</h3>
        <p className="text-text-light font-tajawal text-sm leading-relaxed">سيراجعها فريق التحرير وسنتواصل معك قريبًا.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-7 md:p-9">
      <div className="mb-7">
        <h2 className="text-xl font-bold font-cairo text-navy mb-2">نموذج إرسال القصة</h2>
        <p className="text-text-muted text-sm font-tajawal">جميع المعلومات تُعامَل بسرية ولا تُنشر إلا بموافقتك.</p>
      </div>

      {state === "error" ? <div className="mb-5 flex items-center gap-2 rounded-xl bg-urgent/10 p-4 text-sm font-bold text-urgent"><AlertCircle size={18} /> {message}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-field">الاسم</label>
            <button type="button" onClick={() => setIsAnonymous(!isAnonymous)} className="flex items-center gap-1.5 text-xs font-tajawal text-text-muted hover:text-gold transition-colors">
              {isAnonymous ? <Eye size={13} /> : <EyeOff size={13} />} {isAnonymous ? "إظهار الاسم" : "إخفاء الاسم"}
            </button>
          </div>
          {!isAnonymous ? <input name="fullName" type="text" className="input-field" placeholder="اسمك الكامل أو اسم مستعار" /> : <div className="input-field bg-gray-50 text-text-muted cursor-not-allowed select-none">سيتم نشر القصة بدون اسم</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label-field">رقم التواصل</label><input name="phone" type="tel" className="input-field ltr" dir="ltr" /></div>
          <div><label className="label-field">البريد الإلكتروني</label><input name="email" type="email" className="input-field ltr" dir="ltr" /></div>
        </div>

        <div><label className="label-field">عنوان القصة</label><input name="title" type="text" className="input-field" placeholder="عنوان مختصر للقصة" /></div>
        <div><label className="label-field">المنطقة / المحافظة</label><input name="regionText" type="text" className="input-field" placeholder="مثال: تعز، عدن، صنعاء" /></div>
        <div><label className="label-field">نوع القصة</label><select name="storyType" className="input-field" defaultValue=""><option value="" disabled>اختر النوع</option>{STORY_TYPES.map((type) => <option key={type}>{type}</option>)}</select></div>
        <div><label className="label-field">تفاصيل القصة <span className="text-urgent">*</span></label><textarea name="body" className="textarea-field" required rows={8} placeholder="اكتب القصة بتفاصيل واضحة..." /></div>

        <div>
          <label className="label-field">صور أو ملفات</label>
          <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gold/40 transition-colors cursor-pointer focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
            <Upload size={22} className="text-gold mx-auto mb-2" />
            <p className="text-sm text-text-muted font-tajawal">اضغط لاختيار صور، وثائق، صوت أو فيديو</p>
            <input name="attachments" type="file" className="sr-only" multiple accept="image/*,.pdf,audio/*,video/*" />
          </label>
        </div>

        <label className="flex items-start gap-3 bg-hope/5 border border-hope/20 rounded-xl p-4 cursor-pointer">
          <input type="checkbox" checked={allowPublish} onChange={(e) => setAllowPublish(e.target.checked)} className="mt-1 accent-hope" />
          <span className="text-sm font-cairo font-semibold text-navy">أسمح بنشر القصة بعد المراجعة التحريرية وإخفاء أي بيانات حساسة.</span>
        </label>

        <button disabled={state === "loading"} type="submit" className="w-full btn-hope justify-center py-3.5 text-base disabled:opacity-60"><Send size={18} /> {state === "loading" ? "جارٍ الإرسال..." : "إرسال القصة"}</button>
      </form>
    </div>
  );
}
