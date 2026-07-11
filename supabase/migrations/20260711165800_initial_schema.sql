-- Aktifkan ekstensi untuk generate UUID
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. TABEL PROFILES (extend Supabase Auth "USERS")
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. TABEL PROJECTS
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  event_type text,
  description text,
  progress_status text not null default 'Uploading',
  unique_slug text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_unique_slug on public.projects(unique_slug);

-- ============================================================
-- 3. TABEL PHOTOS
-- ============================================================
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url_original text not null,
  url_edited text,
  filename text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_photos_project_id on public.photos(project_id);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.photos enable row level security;

-- --- PROFILES: fotografer hanya bisa lihat & edit profil sendiri
create policy "Profiles: user can view own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles: user can update own"
  on public.profiles for update
  using (auth.uid() = id);

-- --- PROJECTS: fotografer full akses ke project miliknya
create policy "Projects: owner full access"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- --- PROJECTS: publik boleh BACA project via slug
create policy "Projects: public can view via slug"
  on public.projects for select
  using (true);

-- --- PHOTOS: fotografer full akses ke foto di project miliknya
create policy "Photos: owner full access"
  on public.photos for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = photos.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = photos.project_id and p.user_id = auth.uid()
    )
  );

-- --- PHOTOS: publik boleh BACA foto (untuk galeri klien)
create policy "Photos: public can view"
  on public.photos for select
  using (true);

-- ============================================================
-- 5. FUNGSI KHUSUS: toggle_favorite via RPC
-- ============================================================
create or replace function public.toggle_favorite(photo_id uuid, value boolean)
returns void as $$
begin
  update public.photos
  set is_favorite = value
  where id = photo_id;
end;
$$ language plpgsql security definer;

grant execute on function public.toggle_favorite(uuid, boolean) to anon, authenticated;

-- ============================================================
-- 6. REALTIME
-- ============================================================
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.photos;
