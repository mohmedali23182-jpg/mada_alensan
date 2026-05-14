insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mada-media',
  'mada-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read mada-media" on storage.objects;

create policy "Public read mada-media"
on storage.objects
for select
using (bucket_id = 'mada-media');

do $$
begin
  if to_regclass('public."Post"') is not null then
    create index if not exists "Post_published_status_idx"
    on public."Post" ("status", "publishedAt" desc);

    create index if not exists "Post_scheduled_status_idx"
    on public."Post" ("status", "scheduledAt" asc);

    create index if not exists "Post_featured_idx"
    on public."Post" ("featured", "publishedAt" desc);

    create index if not exists "Post_story_of_day_idx"
    on public."Post" ("isStoryOfDay", "publishedAt" desc);
  end if;

  if to_regclass('public."Case"') is not null then
    create index if not exists "Case_status_urgency_idx"
    on public."Case" ("status", "urgencyLevel", "createdAt" desc);
  end if;

  if to_regclass('public."Submission"') is not null then
    create index if not exists "Submission_type_status_created_idx"
    on public."Submission" ("type", "status", "createdAt" desc);
  end if;
end $$;

-- Smart Editorial + SEO/GEO safe patch
alter table if exists "Post"
add column if not exists "ogTitle" text,
add column if not exists "ogDescription" text,
add column if not exists "twitterTitle" text,
add column if not exists "twitterDescription" text,
add column if not exists "twitterImage" text;

create index if not exists "Post_seo_keywords_idx"
on "Post" using gin ("seoKeywords");

create index if not exists "Post_geo_keywords_idx"
on "Post" using gin ("geoKeywords");
