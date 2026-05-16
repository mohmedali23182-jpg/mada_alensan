import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { MediaUploadInput } from "@/components/admin/MediaUploadInput";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/slug";
import { safeAdminQuery } from "@/lib/admin-safe";
import { formatMakkahDateTime } from "@/lib/date";
import ArticleSmartTools from "@/components/admin/ArticleSmartTools";
import { buildEditorialMetadata } from "@/lib/editorial-intelligence";
import { createPostRevision, ensurePostStats, estimateReadingTime, estimateWordCount, recordPostWorkflow, syncPostSeo } from "@/lib/editorial-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function uniquePostSlug(input: string, currentId?: string) {
  const base = makeSlug(input);
  let slug = base;
  let counter = 2;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${counter++}`;
  }
}

async function savePost(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  if (!title || content.length < 10) throw new Error("العنوان والمحتوى مطلوبان");

  const slugInput = String(formData.get("slug") || "").trim();
  const slug = await uniquePostSlug(slugInput || title, id || undefined);
  const authorName = String(formData.get("authorName") || "").trim();
  const status = String(formData.get("status") || "DRAFT") as never;
  const type = String(formData.get("type") || "NEWS") as never;
  const categoryId = String(formData.get("categoryId") || "") || null;
  const category = categoryId ? await prisma.category.findUnique({ where: { id: categoryId }, select: { name: true } }) : null;
  const scheduledRaw = String(formData.get("scheduledAt") || "").trim();
  const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null;
  const shouldPublish = String(status) === "PUBLISHED";
  const coverImage = String(formData.get("coverImage") || "").trim() || null;
  const thumbnail = String(formData.get("thumbnail") || "").trim() || coverImage;

  const contributor = authorName
    ? await prisma.contributor.upsert({
        where: { slug: makeSlug(authorName) },
        update: { name: authorName, isActive: true },
        create: { name: authorName, slug: makeSlug(authorName), isActive: true },
      })
    : null;

  const autoMeta = buildEditorialMetadata({
    title,
    content,
    excerpt: String(formData.get("excerpt") || ""),
    categoryName: category?.name || "",
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || "مدى الإنسان",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
    slug,
  });
  const manualTags = String(formData.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean);
  const seoKeywords = String(formData.get("seoKeywords") || "").split(",").map((t) => t.trim()).filter(Boolean);
  const geoKeywords = String(formData.get("geoKeywords") || "").split(",").map((t) => t.trim()).filter(Boolean);

  const previous = id ? await prisma.post.findUnique({ where: { id }, select: { status: true, publishedAt: true } }) : null;

  const payload: any = {
    title,
    slug,
    excerpt: String(formData.get("excerpt") || "").trim() || autoMeta.excerpt || null,
    content,
    quote: String(formData.get("quote") || "").trim() || autoMeta.featuredQuote || null,
    coverImage,
    thumbnail,
    type,
    status,
    categoryId,
    contributorId: contributor?.id || null,
    readingTime: Number(formData.get("readingTime") || 0) || autoMeta.readingTime || estimateReadingTime(content),
    wordCount: estimateWordCount(content),
    featured: formData.get("featured") === "on",
    isStoryOfDay: formData.get("isStoryOfDay") === "on",
    seoTitle: String(formData.get("seoTitle") || "").trim() || autoMeta.seoTitle || title,
    seoDescription: String(formData.get("seoDescription") || "").trim() || autoMeta.seoDescription || null,
    seoKeywords: seoKeywords.length ? seoKeywords : (manualTags.length ? manualTags : autoMeta.seoKeywords),
    ogTitle: String(formData.get("ogTitle") || "").trim() || String(formData.get("seoTitle") || "").trim() || autoMeta.ogTitle || title,
    ogDescription: String(formData.get("ogDescription") || "").trim() || String(formData.get("seoDescription") || "").trim() || autoMeta.ogDescription || null,
    ogImage: coverImage || thumbnail || null,
    twitterTitle: String(formData.get("twitterTitle") || "").trim() || String(formData.get("seoTitle") || "").trim() || autoMeta.twitterTitle || title,
    twitterDescription: String(formData.get("twitterDescription") || "").trim() || String(formData.get("seoDescription") || "").trim() || autoMeta.twitterDescription || null,
    twitterImage: coverImage || thumbnail || null,
    canonicalUrl: String(formData.get("canonicalUrl") || "").trim() || autoMeta.canonicalUrl || `${(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/articles/${slug}`,
    city: String(formData.get("city") || "").trim() || autoMeta.city || null,
    country: String(formData.get("country") || "").trim() || autoMeta.country || "اليمن",
    geoKeywords: geoKeywords.length ? geoKeywords : autoMeta.geoKeywords,
    scheduledAt,
    approvedAt: String(status) === "APPROVED" || shouldPublish ? new Date() : null,
    publishedAt: shouldPublish ? (previous?.publishedAt || new Date()) : null,
  };

  const post = id ? await prisma.post.update({ where: { id }, data: payload }) : await prisma.post.create({ data: payload });

  await syncPostSeo(prisma, post.id, payload);
  await ensurePostStats(prisma, post.id, post.viewsCount || 0);
  await createPostRevision(prisma, {
    postId: post.id,
    title,
    excerpt: payload.excerpt,
    content,
    changeNote: id ? "تحديث من لوحة المقالات" : "إنشاء المقال من لوحة المقالات",
    snapshot: payload,
  });
  await recordPostWorkflow(prisma, {
    postId: post.id,
    action: id ? "UPDATED" : "CREATED",
    fromStatus: previous?.status || null,
    toStatus: String(status),
    note: shouldPublish ? "تم نشر المقال من لوحة الإدارة" : null,
  });

  const tags = manualTags.length ? manualTags : autoMeta.seoKeywords;
  await prisma.postTag.deleteMany({ where: { postId: post.id } });
  for (const tagName of tags) {
    const tag = await prisma.tag.upsert({ where: { slug: makeSlug(tagName) }, update: { name: tagName }, create: { name: tagName, slug: makeSlug(tagName) } });
    await prisma.postTag.create({ data: { postId: post.id, tagId: tag.id } });
  }

  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/articles/${post.slug}`);
  redirect(shouldPublish ? `/articles/${post.slug}` : "/admin/articles?saved=1");
}

async function setPostStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "DRAFT") as never;
  if (!id) return;
  const previous = await prisma.post.findUnique({ where: { id }, select: { status: true, publishedAt: true } });
  const data: any = { status };
  if (String(status) === "PUBLISHED") data.publishedAt = previous?.publishedAt || new Date();
  if (String(status) === "APPROVED" || String(status) === "PUBLISHED") data.approvedAt = new Date();
  if (String(status) === "ARCHIVED") data.archivedAt = new Date();
  if (String(status) !== "SCHEDULED") data.scheduledAt = null;
  await prisma.post.update({ where: { id }, data });
  await recordPostWorkflow(prisma, { postId: id, action: String(status) === "PUBLISHED" ? "PUBLISHED" : String(status) === "ARCHIVED" ? "ARCHIVED" : "UPDATED", fromStatus: previous?.status || null, toStatus: String(status) });
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/");
  redirect(String(status) === "PUBLISHED" ? "/admin/articles?published=1" : "/admin/articles?updated=1");
}

export default async function AdminArticlesPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const posts = await safeAdminQuery(
    "articles-list",
    () => prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        coverImage: true,
        thumbnail: true,
        publishedAt: true,
        scheduledAt: true,
        createdAt: true,
        category: { select: { name: true } },
        contributor: { select: { name: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
    }),
    [] as Array<any>,
  );

  const categories = await safeAdminQuery(
    "article-categories",
    () => prisma.category.findMany({ where: { isActive: true }, orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    [] as Array<any>,
  );

  const notice = searchParams?.published ? "تم نشر المقال بنجاح." : searchParams?.saved ? "تم حفظ المقال بنجاح." : searchParams?.updated ? "تم تحديث حالة المقال." : searchParams?.converted ? "تم تحويل القصة إلى مقال للمراجعة." : "";

  return (
    <div className="space-y-6">
      {notice ? <div className="rounded-2xl bg-hope/10 p-4 text-sm font-bold text-hope">{notice}</div> : null}
      <AdminSection title="محرر المقالات" description="إضافة مقال كامل مع غلاف، تصنيف، جدولة، وSEO. كل مقال منشور يحصل على رابط /articles/slug.">
        <form action={savePost} className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-3">
            <input name="title" required placeholder="عنوان المقال" className="input-field text-lg font-bold" />
            <input name="slug" dir="ltr" placeholder="رابط المقال اختياري، يولد تلقائيًا من العنوان" className="input-field" />
            <textarea name="excerpt" placeholder="المقتطف المختصر" className="textarea-field min-h-[90px]" />
            <textarea name="content" required placeholder="نص المقال الكامل" className="textarea-field min-h-[360px] leading-8" />
            <textarea name="quote" placeholder="اقتباس بارز اختياري" className="textarea-field min-h-[80px]" />
          </div>
          <aside className="space-y-3 rounded-3xl bg-ivory-light p-4">
            <ArticleSmartTools siteName={process.env.NEXT_PUBLIC_SITE_NAME || "مدى الإنسان"} siteUrl={process.env.NEXT_PUBLIC_SITE_URL || ""} />
            <select name="categoryId" className="input-field"><option value="">اختر القسم</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select name="type" className="input-field"><option value="NEWS">خبر</option><option value="STORY">قصة</option><option value="HUMAN_MESSAGE">رسالة إنسان</option><option value="CASE_FILE">ملف قضية</option><option value="CONTRIBUTOR_ARTICLE">مقال مشارك</option><option value="REPORT">تقرير</option></select>
            <select name="status" className="input-field"><option value="DRAFT">مسودة</option><option value="REVIEW">مراجعة</option><option value="SCHEDULED">مجدول</option><option value="PUBLISHED">نشر الآن</option></select>
            <input name="scheduledAt" type="datetime-local" className="input-field" />
            <input name="authorName" placeholder="اسم الكاتب اختياري" className="input-field" />
            <MediaUploadInput name="coverImage" label="صورة الغلاف" folder="article-covers" />
            <MediaUploadInput name="thumbnail" label="الصورة المصغرة" folder="article-thumbnails" />
            <input name="tags" placeholder="وسوم مفصولة بفواصل" className="input-field" />
            <input name="city" placeholder="المدينة" className="input-field" />
            <input name="country" defaultValue="اليمن" placeholder="الدولة" className="input-field" />
            <input name="seoTitle" placeholder="عنوان SEO، اختياري" className="input-field" />
            <textarea name="seoDescription" placeholder="وصف SEO، اختياري" className="textarea-field min-h-[80px]" />
            <input name="canonicalUrl" dir="ltr" placeholder="Canonical URL اختياري" className="input-field" />
            <input name="ogTitle" placeholder="عنوان المشاركة OpenGraph" className="input-field" />
            <textarea name="ogDescription" placeholder="وصف المشاركة OpenGraph" className="textarea-field min-h-[70px]" />
            <input name="twitterTitle" placeholder="عنوان X/Twitter" className="input-field" />
            <textarea name="twitterDescription" placeholder="وصف X/Twitter" className="textarea-field min-h-[70px]" />
            <input type="hidden" name="seoKeywords" />
            <input type="hidden" name="geoKeywords" />
            <input type="hidden" name="readingTime" />
            <label className="flex items-center gap-2 text-sm font-bold"><input name="featured" type="checkbox" /> مقال مميز</label>
            <label className="flex items-center gap-2 text-sm font-bold"><input name="isStoryOfDay" type="checkbox" /> قصة اليوم</label>
            <SubmitButton>حفظ المقال</SubmitButton>
          </aside>
        </form>
      </AdminSection>

      <AdminSection title="المقالات الحالية" description="آخر 30 مقالًا فقط لتسريع لوحة الإدارة. استخدم أزرار الحالة لتفعيل النشر أو الأرشفة.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-right text-sm">
            <thead className="text-navy/60"><tr><th className="p-3">العنوان</th><th className="p-3">الكاتب</th><th className="p-3">القسم</th><th className="p-3">الحالة</th><th className="p-3">التاريخ</th><th className="p-3">الرابط</th><th className="p-3">إجراءات</th></tr></thead>
            <tbody>
              {posts.length ? posts.map((article) => (
                <tr key={article.id} className="border-t border-navy/10 align-top">
                  <td className="p-3 font-bold">{article.title}</td>
                  <td className="p-3">{article.contributor?.name || "هيئة التحرير"}</td>
                  <td className="p-3">{article.category?.name || "بدون قسم"}</td>
                  <td className="p-3"><StatusBadge tone={article.status === "PUBLISHED" ? "success" : article.status === "SCHEDULED" ? "warning" : article.status === "ARCHIVED" ? "danger" : "neutral"}>{article.status}</StatusBadge></td>
                  <td className="p-3 text-xs text-navy/60">{formatMakkahDateTime(article.publishedAt || article.scheduledAt || article.createdAt)}</td>
                  <td className="p-3" dir="ltr">{article.status === "PUBLISHED" ? <Link className="font-bold text-teal" href={`/articles/${article.slug}`} target="_blank">{`/articles/${article.slug}`}</Link> : <span className="text-navy/40">ينشر بعد تغيير الحالة إلى PUBLISHED</span>}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {article.status !== "PUBLISHED" ? <form action={setPostStatus}><input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="PUBLISHED" /><button className="rounded-full bg-hope/10 px-3 py-1 text-xs font-bold text-hope">نشر</button></form> : null}
                      {article.status !== "ARCHIVED" ? <form action={setPostStatus}><input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="ARCHIVED" /><button className="rounded-full bg-urgent/10 px-3 py-1 text-xs font-bold text-urgent">أرشفة</button></form> : null}
                      {article.status !== "DRAFT" ? <form action={setPostStatus}><input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value="DRAFT" /><button className="rounded-full bg-white px-3 py-1 text-xs font-bold text-navy">مسودة</button></form> : null}
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={7} className="p-6 text-center text-navy/60">لا توجد مقالات بعد.</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminSection>
    </div>
  );
}
