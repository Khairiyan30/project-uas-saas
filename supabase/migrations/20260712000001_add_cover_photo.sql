-- ============================================================
-- Migration: Tambahkan kolom cover_photo_url ke tabel projects
-- ============================================================

alter table if exists public.projects
  add column if not exists cover_photo_url text;

-- Perbarui policy RLS agar publik bisa membaca cover_photo_url (sudah tercakup
-- oleh policy "Projects: public can view via slug" yang menggunakan using(true)).
