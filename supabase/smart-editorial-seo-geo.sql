-- Smart Editorial + SEO/GEO patch for Madaalinsan
-- Safe to run multiple times after Prisma db push.

alter table if exists "Post"
add column if not exists "ogTitle" text,
add column if not exists "ogDescription" text,
add column if not exists "twitterTitle" text,
add column if not exists "twitterDescription" text,
add column if not exists "twitterImage" text;

create index if not exists "Post_status_published_idx"
on "Post" ("status", "publishedAt" desc);

create index if not exists "Post_slug_status_idx"
on "Post" ("slug", "status");

create index if not exists "Post_seo_keywords_idx"
on "Post" using gin ("seoKeywords");

create index if not exists "Post_geo_keywords_idx"
on "Post" using gin ("geoKeywords");
