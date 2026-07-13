-- ============================================================
-- Migration: RBAC — Role-based access control
-- Adds: role column to profiles, project_clients table, RLS
-- ============================================================

-- 1. Role column on profiles (idempotent)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'photographer'
CHECK (role IN ('photographer', 'client', 'admin'));
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. project_clients junction table (idempotent)
CREATE TABLE IF NOT EXISTS public.project_clients (
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invited_at timestamptz NOT NULL DEFAULT now(),
    accepted_at timestamptz,
    PRIMARY KEY (project_id, client_id)
);
CREATE INDEX IF NOT EXISTS idx_pc_client ON public.project_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_pc_project ON public.project_clients(project_id);

-- 3. RLS: project_clients
ALTER TABLE public.project_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients see own assignments" ON public.project_clients;
CREATE POLICY "Clients see own assignments"
ON public.project_clients FOR SELECT
USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Owners manage assignments" ON public.project_clients;
CREATE POLICY "Owners manage assignments"
ON public.project_clients FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_clients.project_id
        AND p.user_id = auth.uid()
    )
);

-- 4. Projects RLS: assigned clients can view (accepted only)
DROP POLICY IF EXISTS "Projects: public can view via slug" ON public.projects;
DROP POLICY IF EXISTS "Projects: public can view via slug" ON public.projects;
CREATE POLICY "Projects: public can view via slug"
ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Projects: assigned clients can view" ON public.projects;
CREATE POLICY "Projects: assigned clients can view"
ON public.projects FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.project_clients pc
        WHERE pc.project_id = projects.id
        AND pc.client_id = auth.uid()
        AND pc.accepted_at IS NOT NULL
    )
);

-- 5. Photos RLS: assigned clients can view
DROP POLICY IF EXISTS "Photos: public can view" ON public.photos;
DROP POLICY IF EXISTS "Photos: owner can manage" ON public.photos;
CREATE POLICY "Photos: owner can manage"
ON public.photos FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = photos.project_id
        AND p.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Photos: assigned clients can view" ON public.photos;
CREATE POLICY "Photos: assigned clients can view"
ON public.photos FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.project_clients pc
        JOIN public.projects p ON p.id = pc.project_id
        WHERE pc.project_id = photos.project_id
        AND pc.client_id = auth.uid()
        AND pc.accepted_at IS NOT NULL
    )
);

-- 6. Storage RLS: clients view assigned project photos
DROP POLICY IF EXISTS "Storage: public can view" ON storage.objects;
DROP POLICY IF EXISTS "Storage: view photos (owner or assigned client)" ON storage.objects;
CREATE POLICY "Storage: view photos (owner or assigned client)"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'photos'
    AND position('/' in name) > 0
    AND (
        owner = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.project_clients pc
            WHERE pc.client_id = auth.uid()
            AND pc.accepted_at IS NOT NULL
            AND name LIKE pc.project_id::text || '/%'
        )
    )
);

-- 7. Update auth trigger default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'photographer')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
