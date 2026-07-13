-- Migration: Add photo comments (Sprint 3C)

-- 1. Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_photo_id ON public.comments(photo_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- 2. RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Read: owner or assigned client can view comments on photos they can access
CREATE POLICY "Comments: can view on accessible photos"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.photos ph
      JOIN public.projects p ON p.id = ph.project_id
      WHERE ph.id = comments.photo_id
      AND (
        p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_clients pc
          WHERE pc.project_id = p.id
          AND pc.client_id = auth.uid()
          AND pc.accepted_at IS NOT NULL
        )
      )
    )
  );

-- Create: authenticated users can comment on photos they can access
CREATE POLICY "Comments: can create on accessible photos"
  ON public.comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.photos ph
      JOIN public.projects p ON p.id = ph.project_id
      WHERE ph.id = photo_id
      AND (
        p.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_clients pc
          WHERE pc.project_id = p.id
          AND pc.client_id = auth.uid()
          AND pc.accepted_at IS NOT NULL
        )
      )
    )
  );

-- Delete: comment author or project owner can delete
CREATE POLICY "Comments: author or owner can delete"
  ON public.comments FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.photos ph
      JOIN public.projects p ON p.id = ph.project_id
      WHERE ph.id = comments.photo_id
      AND p.user_id = auth.uid()
    )
  );
