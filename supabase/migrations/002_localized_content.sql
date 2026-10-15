-- Optional localized editorial fields (JSON: {"en":"...","sv":"..."})
-- Existing text columns remain supported; readers prefer *_i18n when present.

alter table public.artists
  add column if not exists tagline_i18n jsonb,
  add column if not exists short_bio_i18n jsonb,
  add column if not exists long_bio_i18n jsonb;

alter table public.releases
  add column if not exists description_i18n jsonb,
  add column if not exists credits_i18n jsonb;

alter table public.news
  add column if not exists title_i18n jsonb,
  add column if not exists excerpt_i18n jsonb,
  add column if not exists body_i18n jsonb;

alter table public.site_settings
  add column if not exists label_story_i18n jsonb,
  add column if not exists label_mission_i18n jsonb;

alter table public.press_assets
  add column if not exists title_i18n jsonb,
  add column if not exists alt_i18n jsonb;

comment on column public.artists.tagline_i18n is 'LocalizedString map for admin CMS';
