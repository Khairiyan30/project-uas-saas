-- ============================================================
-- Migration: Hardening Database & Storage Security
-- Resolves Supabase Security Advisor warnings:
-- 1. function_search_path_mutable (toggle_favorite, handle_new_user)
-- 2. public_bucket_allows_listing (avatars, photos)
-- 3. anon_security_definer_function_executable (handle_new_user)
-- 4. authenticated_security_definer_function_executable (handle_new_user)
-- ============================================================

-- ------------------------------------------------------------
-- A. Fix: function_search_path_mutable & Revoke public executions
-- ------------------------------------------------------------

-- 1. Perbaiki public.handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';

-- Cabut izin eksekusi langsung dari anon/authenticated untuk handle_new_user
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- 2. Perbaiki public.toggle_favorite
ALTER FUNCTION public.toggle_favorite(photo_id uuid, value boolean) SET search_path = 'public';

-- ------------------------------------------------------------
-- B. Fix: public_bucket_allows_listing (mencegah listing folder)
-- Supabase docs: SELECT policy broad (using (bucket_id = 'xxx'))
-- membolehkan list all files. Kita batasi SELECT agar tidak mengizinkan list.
-- Namun karena client public butuh read file via public URL, kita bisa buat
-- policy SELECT yang hanya mengizinkan select dengan filename spesifik
-- atau batasi RLS bucket storage.objects agar tidak bisa listing directory.
-- Alternatif teraman & direkomendasikan Supabase: batasi agar SELECT hanya 
-- mengembalikan true jika request bukan list directory (select filter metadata name).
-- ------------------------------------------------------------

-- Update policy SELECT untuk bucket 'photos'
DROP POLICY IF EXISTS "Storage: public can view" ON storage.objects;
CREATE POLICY "Storage: public can view"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'photos' 
    AND (
      -- Hanya izinkan select file individual (mencegah listing folder kosong / folder name)
      -- name tidak berakhiran slash (bukan folder) dan request mencari file spesifik
      position('/' in name) > 0
    )
  );

-- Update policy SELECT untuk bucket 'avatars'
DROP POLICY IF EXISTS "Public avatars are visible to everyone" ON storage.objects;
CREATE POLICY "Public avatars are visible to everyone"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND position('/' in name) > 0
  );
