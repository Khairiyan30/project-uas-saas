-- Migration: Add watermark support (Sprint 3D)

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS watermark_url TEXT,
ADD COLUMN IF NOT EXISTS watermark_position TEXT NOT NULL DEFAULT 'bottom-right',
ADD COLUMN IF NOT EXISTS watermark_opacity REAL NOT NULL DEFAULT 0.5 CHECK (watermark_opacity >= 0.1 AND watermark_opacity <= 1.0),
ADD COLUMN IF NOT EXISTS watermark_size REAL NOT NULL DEFAULT 15 CHECK (watermark_size >= 5 AND watermark_size <= 50);
