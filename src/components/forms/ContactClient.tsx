"use client";

import { useState } from "react";
import { Mail, Send, MessageCircle, CheckCircle, Globe, Camera, Video, AlertCircle } from "lucide-react";
import type { ElementType } from "react";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { readJsonResponse } from "@/lib/http-json";

const iconMap: Record<string, ElementType> = {
  Facebook: Globe,
  Instagram: Camera,
  MessageCircle,
  Twitter: Globe,
  Send,
  Youtube: Video,
  Mail,
};

const CONTACT_ITEMS = [
  { icon: Mail, label: "البريد الإلكتروني", value: "mtzallqmy@gmail.com", href: "mailto:mtzallqmy@gmail.com", color: "#C99A3E" },
  { icon: MessageCircle, label: "واتساب", value: "للتواصل السريع", href: "https://wa.me/967xxxxxxxxx", color: "#25D366" },
  { icon: Send, label: "تليجرام", value: "@madaalinsan", href: "https://t.me/madaalinsan", color: "#2AABEE" },
];

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactClient() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setMessage("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", { method: "POST", body: formData });
      const data = await readJsonResponse(res);
      if (!res.ok || !data.ok) throw new Error(data.message || "تعذر إرسال الرسالة");
      setState("success");
      e.currentTarget.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    }
  }

  return (
    <section className="py-16 md:py-20 bg-ivory">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-bold font-cairo text-navy mb-6">أرسل رسالة</h2>
            {state === "success" ? (
              <div className="bg-white rounded-2xl shadow-card p-10 text-center">
                <div className="w-16 h-16 bg-hope/10 rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle size={32} className="text-hope" /></div>
                <h3 className="text-xl font-bold font-cairo text-navy mb-3">تم إرسال رسالتك!</h3>
                <p className="text-text-light font-tajawal text-sm">سنرد عليك في أقرب وقت ممكن.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-7 space-y-5">
                {state === "error" ? <div className="flex items-center gap-2 rounded-xl bg-urgent/10 p-4 text-sm font-bold text-urgent"><AlertCircle size={18} /> {message}</div> : null}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="label-field">الاسم <span className="text-urgent">*</span></label><input name="name" type="text" className="input-field" required /></div>
                  <div><label className="label-field">البريد الإلكتروني</label><input name="email" type="email" className="input-field ltr" dir="ltr" /></div>
                </div>
                <div><label className="label-field">رقم الهاتف</label><input name="phone" type="tel" className="input-field ltr" dir="ltr" /></div>
                <div><label className="label-field">موضوع الرسالة</label><input name="subject" type="text" className="input-field" /></div>
                <div><label className="label-field">الرسالة <span className="text-urgent">*</span></label><textarea name="message" className="textarea-field" required rows={6} /></div>
                <button disabled={state === "loading"} type="submit" className="w-full btn-primary justify-center py-3.5 text-base disabled:opacity-60"><Send size={18} /> {state === "loading" ? "جارٍ الإرسال..." : "إرسال الرسالة"}</button>
              </form>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold font-cairo text-navy mb-6">طرق التواصل</h2>
              <div className="space-y-4">
                {CONTACT_ITEMS.map((item) => (
                  <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-4 bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15` }}><item.icon size={22} style={{ color: item.color }} /></div>
                    <div><div className="font-semibold font-cairo text-navy text-sm group-hover:text-gold transition-colors">{item.label}</div><div className="text-text-muted text-xs font-tajawal mt-0.5">{item.value}</div></div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold font-cairo text-navy mb-4">تابعنا على</h3>
              <div className="grid grid-cols-3 gap-3">
                {SOCIAL_LINKS.map((social) => {
                  const Icon = iconMap[social.icon];
                  return Icon ? (
                    <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${social.color}15` }}><Icon size={18} style={{ color: social.color }} /></div>
                      <span className="text-xs font-tajawal text-text-muted group-hover:text-navy transition-colors">{social.label}</span>
                    </a>
                  ) : null;
                })}
              </div>
            </div>

            <div className="bg-navy rounded-2xl p-6">
              <h3 className="text-white font-bold font-cairo text-sm mb-4">أوقات الرد</h3>
              <div className="space-y-2.5">
                {[{ day: "السبت – الخميس", time: "9 ص – 9 م" }, { day: "الجمعة", time: "مغلق" }, { day: "الحالات العاجلة", time: "24/7" }].map((item) => <div key={item.day} className="flex justify-between text-sm"><span className="font-tajawal text-ivory/70">{item.day}</span><span className="font-cairo font-semibold text-gold">{item.time}</span></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
