-- Storage helper for Mada Alensan media bucket.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read media files" on storage.objects;
create policy "Public read media files"
on storage.objects
for select
using (bucket_id = 'media');
