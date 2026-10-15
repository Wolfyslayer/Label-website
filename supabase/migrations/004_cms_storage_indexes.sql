-- Phase 5: storage bucket, policies, performance indexes, site social links
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT).

alter table public.site_settings
  add column if not exists social_links jsonb not null default '{}';

alter table public.site_settings
  add column if not exists label_story_i18n jsonb,
  add column if not exists label_mission_i18n jsonb;

create index if not exists artists_status_idx on public.artists (status);
create index if not exists artists_slug_idx on public.artists (slug);

create index if not exists releases_status_release_at_idx on public.releases (status, release_at desc);
create index if not exists releases_artist_id_idx on public.releases (artist_id);
create index if not exists releases_slug_idx on public.releases (slug);

create index if not exists news_status_published_at_idx on public.news (status, published_at desc);
create index if not exists news_slug_idx on public.news (slug);

create index if not exists tracks_release_id_idx on public.tracks (release_id);

-- Storage bucket for CMS uploads (public read, admin write via RLS)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read media objects" on storage.objects;
drop policy if exists "Admin insert media" on storage.objects;
drop policy if exists "Admin update media" on storage.objects;
drop policy if exists "Admin delete media" on storage.objects;

create policy "Public read media objects"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Admin insert media"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());

create policy "Admin update media"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "Admin delete media"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());

-- No public writes to content tables (anon/authenticated non-admin)
revoke insert, update, delete on public.artists from anon, authenticated;
revoke insert, update, delete on public.releases from anon, authenticated;
revoke insert, update, delete on public.tracks from anon, authenticated;
revoke insert, update, delete on public.news from anon, authenticated;
revoke insert, update, delete on public.site_settings from anon, authenticated;
revoke insert, update, delete on public.press_assets from anon, authenticated;

grant insert, update, delete on public.artists to authenticated;
grant insert, update, delete on public.releases to authenticated;
grant insert, update, delete on public.tracks to authenticated;
grant insert, update, delete on public.news to authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant insert, update, delete on public.press_assets to authenticated;

-- RLS still gates actual access via is_admin() policies
