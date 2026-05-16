"use client";

import { useState } from "react";
import {
  buildEditorialMetadata,
  calculateReadingTime,
  extractFeaturedQuote,
  extractKeywords,
  extractSmartExcerpt,
  generateCanonicalUrl,
  generateSeoDescription,
  generateSeoTitle,
} from "@/lib/editorial-intelligence";
import { makeSlug } from "@/lib/slug";

function getField(form: HTMLFormElement, name: string) {
  return form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
}

function setValue(form: HTMLFormElement, name: string, value: string, onlyIfEmpty = true) {
  const field = getField(form, name);
  if (!field) return;
  if (onlyIfEmpty && field.value.trim()) return;
  field.value = value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

export default function ArticleSmartTools({ siteName = "مدى الإنسان", siteUrl = "" }: { siteName?: string; siteUrl?: string }) {
  const [message, setMessage] = useState("");

  function withForm(action: (form: HTMLFormElement) => void) {
    const button = document.activeElement as HTMLElement | null;
    const form = button?.closest("form") || document.querySelector("form");
    if (!form) {
      setMessage("لم يتم العثور على نموذج المقال.");
      return;
    }
    action(form as HTMLFormElement);
  }

  function generateAll() {
    withForm((form) => {
      const title = getField(form, "title")?.value || "";
      const content = getField(form, "content")?.value || "";
      const excerpt = getField(form, "excerpt")?.value || "";
      const categorySelect = getField(form, "categoryId") as HTMLSelectElement | null;
      const categoryName = categorySelect?.selectedOptions?.[0]?.textContent || "";
      const slug = getField(form, "slug")?.value || makeSlug(title);
      const meta = buildEditorialMetadata({ title, content, excerpt, categoryName, siteName, siteUrl, slug });
      setValue(form, "slug", slug, true);
      setValue(form, "excerpt", meta.excerpt, true);
      setValue(form, "quote", meta.featuredQuote, true);
      setValue(form, "seoTitle", meta.seoTitle, true);
      setValue(form, "seoDescription", meta.seoDescription, true);
      setValue(form, "canonicalUrl", meta.canonicalUrl, true);
      setValue(form, "tags", meta.seoKeywords.join(", "), true);
      setValue(form, "city", meta.city || "", true);
      setValue(form, "country", meta.country || "اليمن", true);
      setValue(form, "seoKeywords", meta.seoKeywords.join(","), false);
      setValue(form, "geoKeywords", meta.geoKeywords.join(","), false);
      setValue(form, "ogTitle", meta.ogTitle, true);
      setValue(form, "ogDescription", meta.ogDescription, true);
      setValue(form, "twitterTitle", meta.twitterTitle, true);
      setValue(form, "twitterDescription", meta.twitterDescription, true);
      setValue(form, "readingTime", String(meta.readingTime), false);
      setMessage("تم توليد السيو والمقتطف والاقتباس تلقائيًا. راجعها قبل النشر.");
    });
  }

  function generateExcerpt() {
    withForm((form) => {
      const content = getField(form, "content")?.value || "";
      setValue(form, "excerpt", extractSmartExcerpt(content), false);
      setMessage("تم توليد مقتطف مفهوم من المقال.");
    });
  }

  function generateQuote() {
    withForm((form) => {
      const content = getField(form, "content")?.value || "";
      setValue(form, "quote", extractFeaturedQuote(content), false);
      setMessage("تم اختيار اقتباس بارز من المقال.");
    });
  }

  function generateSeo() {
    withForm((form) => {
      const title = getField(form, "title")?.value || "";
      const content = getField(form, "content")?.value || "";
      const excerpt = getField(form, "excerpt")?.value || "";
      const slug = getField(form, "slug")?.value || makeSlug(title);
      const categorySelect = getField(form, "categoryId") as HTMLSelectElement | null;
      const categoryName = categorySelect?.selectedOptions?.[0]?.textContent || "";
      const keywords = extractKeywords(title, content, categoryName);
      setValue(form, "slug", slug, true);
      setValue(form, "seoTitle", generateSeoTitle(title, siteName), false);
      setValue(form, "seoDescription", generateSeoDescription(content, excerpt), false);
      setValue(form, "canonicalUrl", generateCanonicalUrl(siteUrl, slug), false);
      setValue(form, "tags", keywords.join(", "), true);
      setValue(form, "seoKeywords", keywords.join(","), false);
      setValue(form, "readingTime", String(calculateReadingTime(content)), false);
      setMessage("تم تحديث حقول SEO والكلمات المفتاحية ومدة القراءة.");
    });
  }

  return (
    <div className="rounded-3xl border border-teal/10 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="font-cairo text-sm font-extrabold text-navy">مساعد التحرير الذكي</h3>
        <p className="mt-1 text-xs leading-6 text-navy/60">يعمل محليًا بدون API خارجي. استخدمه لتوليد السيو والمقتطف والاقتباس والكلمات المفتاحية من نص المقال.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={generateAll} className="rounded-2xl bg-navy px-3 py-2 text-xs font-bold text-white">توليد الكل</button>
        <button type="button" onClick={generateSeo} className="rounded-2xl bg-teal/10 px-3 py-2 text-xs font-bold text-teal">SEO تلقائي</button>
        <button type="button" onClick={generateExcerpt} className="rounded-2xl bg-gold/10 px-3 py-2 text-xs font-bold text-gold">مقتطف ذكي</button>
        <button type="button" onClick={generateQuote} className="rounded-2xl bg-hope/10 px-3 py-2 text-xs font-bold text-hope">اقتباس بارز</button>
      </div>
      {message ? <p className="mt-3 rounded-2xl bg-ivory px-3 py-2 text-xs font-bold text-navy/70">{message}</p> : null}
    </div>
  );
}
