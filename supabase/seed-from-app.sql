-- Optional: import starter rows matching lib/data/seed.ts (run after 001_initial_schema.sql)
-- Adjust IDs, dates, and copy before production use.

insert into public.artists (id, slug, name, tagline, short_bio, long_bio, theme, image, hero_image, spotify_artist_url, streaming_links, status)
values
  (
    'artist-frostmark',
    'frostmark',
    'Frostmark',
    'Nordic atmosphere. Folk roots. Songs that linger.',
    'Frostmark creates Swedish Viking-inspired and Nordic folk music — atmospheric soundscapes and socially reflective songwriting rooted in northern tradition.',
    'Frostmark creates Swedish Viking-inspired and Nordic folk music.[Placeholder — replace with approved biography.]',
    'frost',
    '{"src":"/placeholders/frostmark-portrait.svg","alt":"Frostmark placeholder","placeholder":true}'::jsonb,
    '{"src":"/placeholders/frostmark-hero.svg","alt":"Frostmark hero placeholder","placeholder":true}'::jsonb,
    'https://open.spotify.com/artist/0edDVF0bL7PFu2Sc3ijDrP',
    '{"spotify":"https://open.spotify.com/artist/0edDVF0bL7PFu2Sc3ijDrP"}'::jsonb,
    'published'
  ),
  (
    'artist-wolfyslayer',
    'wolfyslayer',
    'Wolfyslayer',
    'Artist on WOLFYSLAYER RECORDS',
    '[Placeholder — add approved short biography for Wolfyslayer.]',
    '[Placeholder — add approved long biography for Wolfyslayer.]',
    'wolf',
    '{"src":"/placeholders/wolfyslayer-portrait.svg","alt":"Wolfyslayer placeholder","placeholder":true}'::jsonb,
    '{"src":"/placeholders/wolfyslayer-hero.svg","alt":"Wolfyslayer hero placeholder","placeholder":true}'::jsonb,
    'https://open.spotify.com/artist/4B4kHkS5D9gK6Q3lNbDPml',
    '{"spotify":"https://open.spotify.com/artist/4B4kHkS5D9gK6Q3lNbDPml"}'::jsonb,
    'published'
  )
on conflict (id) do nothing;
