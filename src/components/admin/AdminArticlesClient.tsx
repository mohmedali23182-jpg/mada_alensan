"use client";

import { useMemo, useState, useTransition } from "react";
import { ImagePlus, Loader2, Plus, Save, Trash2, Upload, X, Eye, Archive, Send } from "lucide-react";

type Category = { id: string; name: string; slug: string; description?: string | null; color?: string | null; order: number; isActive: boolean; _count?: { posts: number } };
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  thumbnail?: string | null;
  quote?: string | null;
  status: string;
  type: string;
  categoryId?: string | null;
  contributorId?: string | null;
  featured?: boolean;
  isStoryOfDay?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[];
  city?: string | null;
  country?: string | null;
  category?: { name: string } | null;
  contributor?: { name: string } | null;
  tags?: { tag: { name: string } }[];
  createdAt?: string;
  publishedAt?: string | null;
};

type ArticleForm = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  thumbnail: string;
  quote: string;
  status: string;
  type: string;
  categoryId: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  city: string;
  country: string;
  featured: boolean;
  isStoryOfDay: boolean;
};

const emptyArticle: ArticleForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "<p></p>",
  coverImage: "",
  thumbnail: "",
  quote: "",
  status: "DRAFT",
  type: "NEWS",
  categoryId: "",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  city: "",
  country: "اليمن",
  featured: false,
  isStoryOfDay: false,
};

const blockButtons = [
  { label: "عنوان", before: "<h2>", after: "</h2>" },
  { label: "فقرة", before: "<p>", after: "</p>" },
  { label: "اقتباس", before: "<blockquote>", after: "</blockquote>" },
  { label: "غامق", before: "<strong>", after: "</strong>" },
  { label: "فاصل", before: "<hr />", after: "" },
];

function htmlToText(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function inferExcerpt(content: string) {
  return htmlToText(content).slice(0, 220);
}

async function apiJson(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok || data?.ok === false) {
    const fieldMessage = data?.errors ? Object.values(data.errors as Record<string, string | string[]>).flat()[0] : null;
    throw new Error(data?.message || String(fieldMessage || "فشل تنفيذ الطلب"));
  }
  return data;
}

function validateCoverImage(file: File) {
  if (!file.type.startsWith("image/")) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = img.width / img.height;
      const ideal = 16 / 9;
      if (img.width < 1200 || img.height < 675) {
        reject(new Error("مقاس الغلاف صغير. المقاس المطلوب 1600×900 أو على الأقل 1200×675."));
        return;
      }
      if (Math.abs(ratio - ideal) > 0.08) {
        reject(new Error("نسبة الغلاف غير مناسبة. استخدم صورة 16:9 مثل 1600×900."));
        return;
      }
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("تعذر قراءة أبعاد الصورة."));
    };
    img.src = url;
  });
}

function uploadFile(file: File, folder: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  return fetch("/api/upload", { method: "POST", body: form }).then(async (res) => {
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.ok === false) throw new Error(data?.message || "فشل رفع الملف");
    return data.media as { url: string };
  });
}

export default function AdminArticlesClient({ initialPosts, initialCategories }: { initialPosts: Post[]; initialCategories: Category[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [form, setForm] = useState<ArticleForm>(emptyArticle);
  const [categoryForm, setCategoryForm] = useState({ id: "", name: "", slug: "", description: "", color: "#2F8F6B", order: 0, isActive: true });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const activeCategories = useMemo(() => categories.filter((c) => c.isActive), [categories]);

  function editPost(post: Post) {
    setSelectedId(post.id);
    setForm({
      id: post.id,
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "<p></p>",
      coverImage: post.coverImage || "",
      thumbnail: post.thumbnail || "",
      quote: post.quote || "",
      status: post.status || "DRAFT",
      type: post.type || "NEWS",
      categoryId: post.categoryId || "",
      tags: post.tags?.map((t) => t.tag.name).join(", ") || "",
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
      city: post.city || "",
      country: post.country || "اليمن",
      featured: Boolean(post.featured),
      isStoryOfDay: Boolean(post.isStoryOfDay),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function insertMarkup(before: string, after: string) {
    const addition = before === "<hr />" ? "\n<hr />\n" : `\n${before}النص هنا${after}\n`;
    setForm((prev) => ({ ...prev, content: `${prev.content || ""}${addition}` }));
  }

  function savePost(nextStatus?: string) {
    startTransition(async () => {
      try {
        const payload = { ...form, status: nextStatus || form.status, excerpt: form.excerpt || inferExcerpt(form.content), seoDescription: form.seoDescription || form.excerpt || inferExcerpt(form.content) };
        const data = await apiJson("/api/admin/posts", { method: "POST", body: JSON.stringify(payload) });
        setPosts((prev) => [data.item, ...prev.filter((p) => p.id !== data.item.id)]);
        setForm(emptyArticle);
        setSelectedId(null);
        setMessage("تم حفظ المقال بنجاح.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "فشل حفظ المقال");
      }
    });
  }

  function changeStatus(id: string, status: string) {
    startTransition(async () => {
      try {
        const data = await apiJson("/api/admin/posts", { method: "PATCH", body: JSON.stringify({ id, status }) });
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data.item } : p)));
        setMessage(status === "PUBLISHED" ? "تم نشر المقال وإعادة توليد السيو والفهارس." : "تم تحديث حالة المقال.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "فشل تحديث الحالة");
      }
    });
  }

  function deletePost(id: string) {
    if (!confirm("حذف المقال نهائياً؟")) return;
    startTransition(async () => {
      try {
        await apiJson("/api/admin/posts", { method: "DELETE", body: JSON.stringify({ id }) });
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setMessage("تم حذف المقال.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "فشل الحذف");
      }
    });
  }

  function saveCategory() {
    startTransition(async () => {
      try {
        const method = categoryForm.id ? "PATCH" : "POST";
        const data = await apiJson("/api/admin/categories", { method, body: JSON.stringify(categoryForm) });
        setCategories((prev) => [data.item, ...prev.filter((c) => c.id !== data.item.id)].sort((a, b) => a.order - b.order));
        setCategoryForm({ id: "", name: "", slug: "", description: "", color: "#2F8F6B", order: 0, isActive: true });
        setMessage("تم حفظ التصنيف.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "فشل حفظ التصنيف");
      }
    });
  }

  function deleteCategory(id: string) {
    if (!confirm("سيتم حذف التصنيف أو تعطيله إذا كان مرتبطاً بمقالات. متابعة؟")) return;
    startTransition(async () => {
      try {
        const data = await apiJson("/api/admin/categories", { method: "DELETE", body: JSON.stringify({ id }) });
        if (data.item) setCategories((prev) => prev.map((c) => (c.id === id ? data.item : c)));
        else setCategories((prev) => prev.filter((c) => c.id !== id));
        setMessage(data.message || "تم تحديث التصنيف.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "فشل حذف التصنيف");
      }
    });
  }

  async function onUpload(file: File, target: "coverImage" | "thumbnail" | "content") {
    setMessage("جاري رفع الملف...");
    try {
      if (target === "coverImage" || target === "thumbnail") await validateCoverImage(file);
      const media = await uploadFile(file, target === "content" ? "article-body" : "article-covers");
      if (target === "content") {
        setForm((prev) => ({ ...prev, content: `${prev.content}\n<figure><img src="${media.url}" alt="صورة داخل المقال" loading="lazy" decoding="async" /><figcaption></figcaption></figure>` }));
      } else {
        setForm((prev) => ({ ...prev, [target]: media.url }));
      }
      setMessage("تم رفع الملف.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فشل رفع الملف");
    }
  }

  return (
    <div className="space-y-6">
      {message ? <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm font-bold text-navy">{message}</div> : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-3xl bg-white p-4 shadow-card md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-cairo text-xl font-black text-navy">محرر المقالات المتقدم</h2>
              <p className="text-sm text-navy/60">محرر سريع وآمن. مقاس الغلاف المثالي: 1600×900 بنسبة 16:9، والحد الأدنى 1200×675.</p>
            </div>
            <button onClick={() => { setForm(emptyArticle); setSelectedId(null); }} className="rounded-full bg-ivory px-4 py-2 text-sm font-bold text-navy"><Plus size={15} className="inline" /> جديد</button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input className="input-field md:col-span-2" placeholder="عنوان المقال" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="input-field" dir="ltr" placeholder="slug اختياري" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">اختر التصنيف</option>
              {activeCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea className="textarea-field md:col-span-2 min-h-[90px]" placeholder="المقتطف المختصر" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>

          <div className="mt-4 rounded-2xl border border-navy/10 bg-ivory-light p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {blockButtons.map((btn) => <button key={btn.label} onClick={() => insertMarkup(btn.before, btn.after)} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-navy shadow-sm" type="button">{btn.label}</button>)}
              <label className="cursor-pointer rounded-xl bg-white px-3 py-2 text-xs font-bold text-teal shadow-sm">
                <ImagePlus size={14} className="inline" /> صورة داخلية
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "content")} />
              </label>
            </div>
            <textarea className="textarea-field min-h-[360px] font-mono text-sm leading-7" dir="rtl" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl bg-white p-4 shadow-card md:p-5">
          <h3 className="font-cairo text-lg font-black text-navy">النشر والسيو</h3>
          <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="DRAFT">مسودة</option><option value="REVIEW">مراجعة</option><option value="SCHEDULED">مجدول</option><option value="PUBLISHED">منشور</option><option value="ARCHIVED">مؤرشف</option>
          </select>
          <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="NEWS">خبر</option><option value="STORY">قصة</option><option value="HUMAN_MESSAGE">رسالة إنسان</option><option value="CASE_FILE">ملف قضية</option><option value="CONTRIBUTOR_ARTICLE">مقال مشارك</option><option value="REPORT">تقرير</option>
          </select>
          <input className="input-field" placeholder="وسوم: تعليم، نزوح، علاج" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <input className="input-field" placeholder="عنوان SEO" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          <textarea className="textarea-field min-h-[80px]" placeholder="وصف SEO" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
          <input className="input-field" placeholder="المدينة" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="input-field" placeholder="الدولة" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <textarea className="textarea-field min-h-[70px]" placeholder="اقتباس بارز" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
          <div className="space-y-2">
            <input className="input-field" dir="ltr" placeholder="رابط الغلاف الاختياري - الأفضل رفع صورة 1600×900" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
            <p className="text-xs leading-6 text-navy/55">الغلاف اختياري. إن لم تضف غلافًا سيظهر قالب محلي بسيط لا صورة وهمية من الإنترنت.</p>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-navy/20 p-3 text-sm font-bold text-navy/70"><Upload size={16} /> رفع غلاف<input className="hidden" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "coverImage")} /></label>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> مقال مميز</label>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.isStoryOfDay} onChange={(e) => setForm({ ...form, isStoryOfDay: e.target.checked })} /> قصة اليوم</label>
          <button disabled={isPending || !form.title || htmlToText(form.content).length < 20} onClick={() => savePost()} className="w-full rounded-2xl bg-navy px-4 py-3 font-bold text-white disabled:opacity-50">{isPending ? <Loader2 className="inline animate-spin" /> : <Save className="inline" />} حفظ</button>
          <button disabled={isPending || !form.title} onClick={() => savePost("PUBLISHED")} className="w-full rounded-2xl bg-hope px-4 py-3 font-bold text-white disabled:opacity-50"><Send className="inline" /> حفظ ونشر</button>
          {selectedId ? <button onClick={() => { setForm(emptyArticle); setSelectedId(null); }} className="w-full rounded-2xl bg-ivory px-4 py-3 font-bold text-navy"><X className="inline" /> إلغاء التعديل</button> : null}
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <h2 className="mb-3 font-cairo text-lg font-black text-navy">إدارة التصنيفات</h2>
          <div className="space-y-2">
            <input className="input-field" placeholder="اسم التصنيف" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            <input className="input-field" dir="ltr" placeholder="slug اختياري" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
            <textarea className="textarea-field min-h-[70px]" placeholder="الوصف" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            <input className="input-field" type="number" placeholder="الترتيب" value={categoryForm.order} onChange={(e) => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })} />
            <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={categoryForm.isActive} onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })} /> نشط</label>
            <button onClick={saveCategory} className="w-full rounded-2xl bg-teal px-4 py-3 font-bold text-white">حفظ التصنيف</button>
          </div>
          <div className="mt-4 space-y-2">
            {categories.map((c) => <div key={c.id} className="flex items-center justify-between rounded-2xl bg-ivory-light p-3 text-sm"><button onClick={() => setCategoryForm({ id: c.id, name: c.name, slug: c.slug, description: c.description || "", color: c.color || "#2F8F6B", order: c.order, isActive: c.isActive })} className="text-right font-bold text-navy">{c.name}<span className="block text-xs text-navy/50">{c._count?.posts ?? 0} مقال</span></button><button onClick={() => deleteCategory(c.id)} className="text-urgent"><Trash2 size={16} /></button></div>)}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-card">
          <h2 className="mb-3 font-cairo text-lg font-black text-navy">المقالات الحالية</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-sm">
              <thead className="text-navy/50"><tr><th className="p-3">العنوان</th><th className="p-3">القسم</th><th className="p-3">الحالة</th><th className="p-3">الرابط</th><th className="p-3">إجراءات</th></tr></thead>
              <tbody>
                {posts.map((post) => <tr key={post.id} className="border-t border-navy/10 align-top"><td className="p-3 font-bold text-navy">{post.title}<span className="block text-xs font-normal text-navy/50">{post.contributor?.name || "فريق التحرير"}</span></td><td className="p-3">{post.category?.name || "-"}</td><td className="p-3"><span className="rounded-full bg-ivory px-3 py-1 text-xs font-bold">{post.status}</span></td><td className="p-3" dir="ltr">/articles/{post.slug}</td><td className="p-3"><div className="flex flex-wrap gap-2"><button onClick={() => editPost(post)} className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white"><Eye size={13} className="inline" /> تعديل</button><button onClick={() => changeStatus(post.id, "PUBLISHED")} className="rounded-full bg-hope/10 px-3 py-1 text-xs font-bold text-hope">نشر</button><button onClick={() => changeStatus(post.id, "ARCHIVED")} className="rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold"><Archive size={13} className="inline" /> أرشفة</button><button onClick={() => deletePost(post.id)} className="rounded-full bg-urgent/10 px-3 py-1 text-xs font-bold text-urgent"><Trash2 size={13} className="inline" /> حذف</button></div></td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
