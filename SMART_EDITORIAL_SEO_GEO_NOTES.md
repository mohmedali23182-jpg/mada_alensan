# Smart Editorial + SEO/GEO Patch

This patch adds a local smart editorial layer without any external AI provider.

## Added

- `src/lib/editorial-intelligence.ts`
  - Smart excerpt extraction
  - Featured quote extraction
  - SEO title/description generation
  - Keyword extraction
  - Reading time calculation
  - Basic GEO hint extraction from Arabic content
  - Canonical URL generation

- `src/components/admin/ArticleSmartTools.tsx`
  - Client-side assistant inside the article editor
  - Buttons for: generate all, SEO, excerpt, quote
  - Populates article form fields without calling external APIs

## Updated

- `src/app/admin/articles/page.tsx`
  - Uses smart editorial metadata when fields are empty
  - Saves `seoKeywords`, `geoKeywords`, `ogTitle`, `ogDescription`, `twitterTitle`, `twitterDescription`, `twitterImage`
  - Uses `coverImage` as OpenGraph/Twitter image
  - Generates canonical URL automatically

- `src/app/articles/[slug]/page.tsx`
  - Uses dynamic metadata from DB
  - Adds Article JSON-LD and Breadcrumb JSON-LD
  - Keeps cover image, excerpt, quote, author, reading time, and Makkah publication time visible

- `src/lib/seo.ts`
  - Supports keywords, canonical, OG and Twitter overrides

- `prisma/schema.prisma`
  - Adds social metadata fields to `Post`

## Required DB update

Run:

```bash
npx prisma generate
npx prisma db push
```

Or run the safe SQL in:

```text
supabase/smart-editorial-seo-geo.sql
```

## Important

This patch does not use external AI. It is rule-based and safe for Vercel deployment.
