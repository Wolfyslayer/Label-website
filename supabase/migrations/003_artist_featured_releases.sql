alter table public.artists
  add column if not exists featured_release_ids text[] default '{}';

comment on column public.artists.featured_release_ids is 'Ordered release IDs highlighted on the artist profile';
