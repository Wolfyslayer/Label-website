-- WOLFYSLAYER RECORDS — initial schema
-- Run in Supabase SQL editor or via CLI: supabase db push

create extension if not exists "pgcrypto";

-- Admin allowlist (never grant admin via public signup)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can read admin_users"
  on public.admin_users for select
  using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  label_story text not null default '',
  label_mission text not null default '',
  featured_release_id text,
  homepage_featured_news_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Public read site_settings"
  on public.site_settings for select using (true);

create policy "Admin write site_settings"
  on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (id) values (1) on conflict do nothing;

create table if not exists public.artists (
  id text primary key,
  slug text not null unique,
  name text not null,
  tagline text default '',
  short_bio text default '',
  long_bio text default '',
  theme text not null check (theme in ('frost', 'wolf')),
  image jsonb not null default '{}',
  hero_image jsonb,
  spotify_artist_url text default '',
  streaming_links jsonb not null default '{}',
  social_links jsonb not null default '{}',
  featured_track_ids text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.releases (
  id text primary key,
  slug text not null unique,
  title text not null,
  artist_id text not null references public.artists (id) on delete cascade,
  type text not null check (type in ('album', 'single', 'ep')),
  release_date date not null,
  release_at timestamptz not null,
  description text default '',
  credits text,
  cover jsonb not null default '{}',
  streaming_links jsonb not null default '{}',
  spotify_album_url text,
  track_ids text[] not null default '{}',
  featured boolean not null default false,
  pre_save_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id text primary key,
  slug text not null,
  title text not null,
  artist_id text not null references public.artists (id) on delete cascade,
  release_id text not null references public.releases (id) on delete cascade,
  track_number int not null default 1,
  duration_seconds int,
  spotify_track_url text
);

create table if not exists public.news (
  id text primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  published_at timestamptz not null default now(),
  artist_id text references public.artists (id) on delete set null,
  release_id text references public.releases (id) on delete set null,
  cover jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_at timestamptz not null default now()
);

create table if not exists public.press_assets (
  id text primary key,
  title text not null,
  type text not null check (type in ('photo', 'logo', 'epk')),
  artist_id text references public.artists (id) on delete set null,
  download_url text,
  src text not null,
  alt text not null default '',
  placeholder boolean not null default true
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  ip_address text,
  created_at timestamptz not null default now()
);

alter table public.artists enable row level security;
alter table public.releases enable row level security;
alter table public.tracks enable row level security;
alter table public.news enable row level security;
alter table public.press_assets enable row level security;
alter table public.contact_submissions enable row level security;

-- Public reads: published content only
create policy "Public read published artists"
  on public.artists for select using (status = 'published' or public.is_admin());

create policy "Admin manage artists"
  on public.artists for all using (public.is_admin()) with check (public.is_admin());

create policy "Public read published releases"
  on public.releases for select using (status = 'published' or public.is_admin());

create policy "Admin manage releases"
  on public.releases for all using (public.is_admin()) with check (public.is_admin());

create policy "Public read tracks"
  on public.tracks for select using (
    public.is_admin() or exists (
      select 1 from public.releases r
      where r.id = release_id and r.status = 'published'
    )
  );

create policy "Admin manage tracks"
  on public.tracks for all using (public.is_admin()) with check (public.is_admin());

create policy "Public read published news"
  on public.news for select using (status = 'published' or public.is_admin());

create policy "Admin manage news"
  on public.news for all using (public.is_admin()) with check (public.is_admin());

create policy "Public read press_assets"
  on public.press_assets for select using (true);

create policy "Admin manage press_assets"
  on public.press_assets for all using (public.is_admin()) with check (public.is_admin());

create policy "Service insert contact"
  on public.contact_submissions for insert with check (true);

create policy "Admin read contact"
  on public.contact_submissions for select using (public.is_admin());

-- Storage bucket (run separately in dashboard or storage API):
-- bucket: media, public read, admin write
