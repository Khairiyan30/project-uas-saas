-- ============================================================
-- Migration: Ubah "Menunggu Reviu" menjadi "Menunggu Review"
-- ============================================================

update public.projects
set progress_status = 'Menunggu Review'
where progress_status = 'Menunggu Reviu';