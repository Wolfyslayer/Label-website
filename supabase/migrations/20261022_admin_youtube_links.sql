-- Apply through Supabase SQL editor or migrations. No service role keys in browser.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;
create policy "admins can read own membership" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.youtube_link_proposals (
  track_id text primary key,
  spotify_track_id text not null,
  youtube_url text not null check (youtube_url ~ '^https://music[.]youtube[.]com/watch[?]v=[A-Za-z0-9_-]{11}$'),
  proposed_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);
alter table public.youtube_link_proposals enable row level security;
create policy "admins can read proposals" on public.youtube_link_proposals
  for select to authenticated using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
create policy "admins can insert own proposals" on public.youtube_link_proposals
  for insert to authenticated with check (
    proposed_by = (select auth.uid()) and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );
create policy "admins can update own proposals" on public.youtube_link_proposals
  for update to authenticated using (
    exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  ) with check (
    proposed_by = (select auth.uid()) and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );
-- Admin membership must be granted manually by the database owner.
-- insert into public.admin_users(user_id) values ('<AUTH_USER_UUID>');
