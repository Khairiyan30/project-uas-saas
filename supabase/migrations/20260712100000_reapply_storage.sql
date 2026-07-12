-- Cleanup orphaned storage policies (tanpa bucket) lalu re-create bucket
drop policy if exists "Storage: authenticated can upload" on storage.objects;
drop policy if exists "Storage: authenticated can manage own" on storage.objects;
drop policy if exists "Storage: public can view" on storage.objects;
drop policy if exists "Public avatars are visible to everyone" on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;
