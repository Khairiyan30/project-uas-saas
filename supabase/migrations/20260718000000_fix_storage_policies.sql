-- ============================================================
-- Migration: Fix missing storage bucket policies
-- RBAC migration (20260712120000) dropped INSERT & ALL policies
-- without re-creating them. This adds them back.
-- ============================================================

-- ------------------------------------------------------------
-- PHOTOS BUCKET
-- ------------------------------------------------------------

-- INSERT: authenticated users (photographers) can upload
drop policy if exists "Storage: authenticated can upload" on storage.objects;
create policy "Storage: authenticated can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

-- ALL: owner can update/delete their own files
drop policy if exists "Storage: authenticated can manage own" on storage.objects;
create policy "Storage: authenticated can manage own"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'photos' and owner = auth.uid());

-- ------------------------------------------------------------
-- AVATARS BUCKET
-- ------------------------------------------------------------

-- Ensure bucket exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[]
)
on conflict (id) do nothing;

-- SELECT: public can view avatars
drop policy if exists "Public avatars are visible to everyone" on storage.objects;
create policy "Public avatars are visible to everyone"
  on storage.objects for select
  using (bucket_id = 'avatars' and position('/' in name) > 0);

-- INSERT: authenticated users can upload their own avatar
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: users can update their own avatar
drop policy if exists "Users can update their own avatar" on storage.objects;
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

-- DELETE: users can delete their own avatar
drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
