-- ============================================================
-- Migration: Restrict toggle_favorite to authenticated users only
-- Anon users can no longer toggle favorites
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.toggle_favorite(uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.toggle_favorite(uuid, boolean) TO authenticated;
