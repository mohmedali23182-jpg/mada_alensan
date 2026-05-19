-- Supabase Storage bucket for Mada Alensan media uploads.
-- Run in Supabase SQL Editor once if uploads show "Bucket not found".

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4',
    'audio/mpeg', 'audio/mp4', 'audio/wav',
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

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Public read media files') then
    create policy "Public read media files" on storage.objects for select using (bucket_id = 'media');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Service role upload media files') then
    create policy "Service role upload media files" on storage.objects for insert with check (bucket_id = 'media');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Service role update media files') then
    create policy "Service role update media files" on storage.objects for update using (bucket_id = 'media') with check (bucket_id = 'media');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Service role delete media files') then
    create policy "Service role delete media files" on storage.objects for delete using (bucket_id = 'media');
  end if;
end $$;
