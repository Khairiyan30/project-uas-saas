-- ============================================================
-- STORAGE BUCKET: photos (foto proyek)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Fotografer (authenticated) boleh upload foto
create policy "Storage: authenticated can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

-- Fotografer boleh hapus/update foto miliknya
create policy "Storage: authenticated can manage own"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'photos' and owner = auth.uid());

-- Publik boleh lihat/download foto (untuk galeri klien)
create policy "Storage: public can view"
  on storage.objects for select
  using (bucket_id = 'photos');

-- ============================================================
-- STORAGE BUCKET: avatars (foto profil fotografer)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatars',
    'avatars',
    true,
    2097152,
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[]
)
on conflict (id) do nothing;

create policy "Public avatars are visible to everyone"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
on storage.objects for insert
with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own avatar"
on storage.objects for update
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own avatar"
on storage.objects for delete
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);
