-- ============================================================
-- Migration: Remove comments & approval workflow
-- Drops: comments table, photo_status type, related RPCs
-- ============================================================

-- 1. Drop RPC functions (before dropping type that they reference)
drop function if exists public.finalize_curation(uuid);
drop function if exists public.update_photo_status(uuid, public.photo_status);

-- 2. Drop comments table
drop table if exists public.comments;

-- 3. Drop photo_status column from photos
alter table public.photos drop column if exists status;

-- 4. Drop photo_status enum type
drop type if exists public.photo_status;
