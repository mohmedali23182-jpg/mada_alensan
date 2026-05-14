-- Create Supabase Storage bucket used by the media uploader.
-- Run after project setup if the bucket does not exist.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mada-media',
  'mada-media',
  true,
  52428800,
  array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml','video/mp4','audio/mpeg','audio/mp4','application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read policy for media files.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'mada_media_public_read'
  ) then
    create policy "mada_media_public_read"
    on storage.objects
    for select
    using (bucket_id = 'mada-media');
  end if;
end $$;
