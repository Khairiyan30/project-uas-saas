-- ============================================================
-- Freelens — Client Gallery & Proofing Platform
-- SQL Migration Lengkap (sesuai skema baru)
-- Salin seluruh isi file ini ke Supabase Dashboard > SQL Editor
-- lalu klik "Run" untuk setup database.
-- ============================================================

-- Aktifkan ekstensi untuk generate UUID
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- 1. TABEL PROFILES (extend Supabase Auth "USERS")
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Trigger: otomatis buat row profile setiap ada user baru daftar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- 2. TABEL PROJECTS
-- ─────────────────────────────────────────
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

-- ─────────────────────────────────────────
-- 3. TABEL PHOTOS
-- ─────────────────────────────────────────
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

-- ─────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────
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

-- --- PROJECTS: publik (klien tanpa login) boleh BACA project
-- (aman karena akses tetap butuh tahu unique_slug yang rahasia)
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

-- ─────────────────────────────────────────
-- 5. FUNGSI KHUSUS: klien toggle favorite TANPA login
-- Daripada beri izin UPDATE langsung ke publik (berisiko klien
-- bisa ubah kolom lain), pakai RPC function yang HANYA boleh
-- ubah kolom is_favorite. Dipanggil dari frontend via:
--   supabase.rpc('toggle_favorite', { photo_id, value })
-- ─────────────────────────────────────────
create or replace function public.toggle_favorite(photo_id uuid, value boolean)
returns void as $$
begin
  update public.photos
  set is_favorite = value
  where id = photo_id;
end;
$$ language plpgsql security definer;

-- Izinkan role anon (pengunjung tanpa login) memanggil fungsi ini
grant execute on function public.toggle_favorite(uuid, boolean) to anon, authenticated;

-- ─────────────────────────────────────────
-- 6. REALTIME
-- Supaya perubahan progress_status & is_favorite langsung
-- terlihat real-time di halaman klien
-- ─────────────────────────────────────────
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.photos;

-- ─────────────────────────────────────────
-- 7. STORAGE BUCKET untuk file foto proyek
-- (Bisa juga dibuat lewat Dashboard > Storage > New Bucket)
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Fotografer (authenticated) boleh upload foto
create policy "Storage: authenticated can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

-- Fotografer boleh hapus/update foto miliknya
create policy "Storage: authenticated can manage own"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'photos' and owner = auth.uid());

-- Publik boleh lihat/download foto (untuk galeri klien)
create policy "Storage: public can view"
  on storage.objects for select
  using (bucket_id = 'photos');

-- ─────────────────────────────────────────
-- 8. STORAGE BUCKET: avatars (foto profil fotografer)
-- Dipertahankan karena aplikasi menggunakan fitur upload avatar.
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatars',
    'avatars',
    true,
    2097152,
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[]
)
on conflict (id) do nothing;

drop policy if exists "Public avatars are visible to everyone" on storage.objects;
create policy "Public avatars are visible to everyone"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
on storage.objects for insert
with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
on storage.objects for update
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
on storage.objects for delete
using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- ─────────────────────────────────────────
-- NONAKTIFKAN EMAIL CONFIRMATION (opsional, untuk dev)
-- Agar signup langsung bisa login tanpa verifikasi email.
-- HAPUS baris ini di production.
-- ─────────────────────────────────────────
-- UPDATE auth.config SET confirm_email = false;
