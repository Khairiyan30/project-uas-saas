-- Migration: Add photo approval workflow (Sprint 3B)

-- 1. Photo status enum
CREATE TYPE public.photo_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Add status column to photos
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS status photo_status NOT NULL DEFAULT 'pending';
CREATE INDEX IF NOT EXISTS idx_photos_status ON public.photos(status);

-- 3. RPC: update photo approval (client or owner)
CREATE OR REPLACE FUNCTION public.update_photo_status(photo_id uuid, new_status photo_status)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.photos
  SET status = new_status
  WHERE id = photo_id
  AND (
    -- Owner can update
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = photos.project_id
      AND p.user_id = auth.uid()
    )
    OR
    -- Assigned client can update
    EXISTS (
      SELECT 1 FROM public.project_clients pc
      WHERE pc.project_id = photos.project_id
      AND pc.client_id = auth.uid()
      AND pc.accepted_at IS NOT NULL
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_photo_status(UUID, photo_status) TO authenticated;

-- 4. RPC: finalize curation — mark all pending as approved, update project progress
CREATE OR REPLACE FUNCTION public.finalize_curation(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Mark all pending photos as approved
  UPDATE public.photos
  SET status = 'approved'
  WHERE project_id = finalize_curation.project_id
  AND status = 'pending';

  -- Update project progress to Selesai
  UPDATE public.projects
  SET progress_status = 'Selesai'
  WHERE id = finalize_curation.project_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.finalize_curation(UUID) TO authenticated;
