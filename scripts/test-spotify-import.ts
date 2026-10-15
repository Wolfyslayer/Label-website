import assert from "node:assert/strict";
import { pickFeaturedReleaseId } from "@/lib/content/featured-release";
import { SPOTIFY_ARTIST_ALBUMS_PAGE_LIMIT } from "@/lib/spotify/constants";
import { fetchArtistAlbumsPage } from "@/lib/spotify/api";
import { SpotifyAuthError, requireSpotifyCredentials } from "@/lib/spotify/auth";
import { dedupeSpotifyAlbums } from "@/lib/spotify/dedupe";
import { parseSpotifyReleaseDate } from "@/lib/spotify/dates";
import { importSpotifyCatalog } from "@/lib/spotify/import-catalog";
import { albumBelongsToSpotifyArtist } from "@/lib/spotify/ownership";
import { mapSpotifyTracksToContent, slugForSpotifyAlbum } from "@/lib/spotify/map-content";
import { planImportWrites } from "@/lib/spotify/write-content";
import type { SpotifyFullAlbum, SpotifySimplifiedAlbum } from "@/lib/spotify/types";
import type { ReleaseSource } from "@/lib/types/content";

function mockAlbum(id: string, artistId: string, title: string): SpotifySimplifiedAlbum {
  return {
    id,
    name: title,
    album_type: "single",
    release_date: "2024-06-15",
    release_date_precision: "day",
    total_tracks: 1,
    external_urls: { spotify: `https://open.spotify.com/album/${id}` },
    artists: [{ id: artistId, name: "Frostmark" }],
    images: [{ url: "https://i.scdn.co/image/test-cover", height: 640, width: 640 }],
    album_group: "single",
  };
}

function mockFetch(handlers: Record<string, () => unknown>): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("accounts.spotify.com/api/token")) {
      return new Response(JSON.stringify({ access_token: "test-token", token_type: "Bearer", expires_in: 3600 }), {
        status: 200,
      });
    }
    for (const [key, fn] of Object.entries(handlers)) {
      if (url.includes(key)) {
        return new Response(JSON.stringify(fn()), { status: 200 });
      }
    }
    if (init?.method === "POST") {
      return new Response("not found", { status: 404 });
    }
    return new Response(`Unhandled mock URL: ${url}`, { status: 500 });
  };
}

async function testAuthMissing() {
  const prevId = process.env.SPOTIFY_CLIENT_ID;
  const prevSecret = process.env.SPOTIFY_CLIENT_SECRET;
  delete process.env.SPOTIFY_CLIENT_ID;
  delete process.env.SPOTIFY_CLIENT_SECRET;
  assert.throws(() => requireSpotifyCredentials(), SpotifyAuthError);
  process.env.SPOTIFY_CLIENT_ID = prevId;
  process.env.SPOTIFY_CLIENT_SECRET = prevSecret;
}

function testDates() {
  const year = parseSpotifyReleaseDate("2023", "year");
  assert.equal(year.releaseDate, "2023-01-01");
  assert.equal(year.releaseDatePrecision, "year");

  const month = parseSpotifyReleaseDate("2024-03", "month");
  assert.equal(month.releaseDate, "2024-03-01");
  assert.equal(month.releaseDatePrecision, "month");

  const day = parseSpotifyReleaseDate("2024-06-15", "day");
  assert.equal(day.releaseDate, "2024-06-15");
  assert.equal(day.releaseDatePrecision, "day");
}

function testDedupe() {
  const a = mockAlbum("aaa111", "0edDVF0bL7PFu2Sc3ijDrP", "One");
  const dup = { ...a };
  const guest = { ...a, id: "bbb222", album_group: "appears_on" as const };
  const out = dedupeSpotifyAlbums([a, dup, guest]);
  assert.equal(out.length, 1);
  assert.equal(out[0].id, "aaa111");
}

function testOwnership() {
  const album = mockAlbum("x", "0edDVF0bL7PFu2Sc3ijDrP", "Owned");
  assert.equal(albumBelongsToSpotifyArtist(album, "0edDVF0bL7PFu2Sc3ijDrP"), true);
  assert.equal(albumBelongsToSpotifyArtist(album, "other"), false);
}

function testTrackOrdering() {
  const album = mockAlbum("alb1", "0edDVF0bL7PFu2Sc3ijDrP", "Album") as SpotifyFullAlbum;
  const tracks = mapSpotifyTracksToContent(
    album,
    [
      {
        id: "t2",
        name: "B",
        track_number: 1,
        disc_number: 2,
        duration_ms: 120000,
        external_urls: { spotify: "https://open.spotify.com/track/t2" },
        artists: [{ id: "0edDVF0bL7PFu2Sc3ijDrP", name: "Frostmark" }],
      },
      {
        id: "t1",
        name: "A",
        track_number: 1,
        disc_number: 1,
        duration_ms: 90000,
        external_urls: { spotify: "https://open.spotify.com/track/t1" },
        artists: [{ id: "0edDVF0bL7PFu2Sc3ijDrP", name: "Frostmark" }],
      },
    ],
    "artist-frostmark",
    "release-spotify-alb1",
    "0edDVF0bL7PFu2Sc3ijDrP",
    new Map(),
  );
  assert.equal(tracks[0].title, "A");
  assert.equal(tracks[1].title, "B");
  assert.equal(tracks[0].trackNumber, 1);
  assert.equal(tracks[1].trackNumber, 2);
  assert.equal(tracks[1].discNumber, 2);
}

function testFeaturedPick() {
  const releases: ReleaseSource[] = [
    {
      id: "r-old",
      slug: "old",
      title: "Old",
      artistId: "artist-frostmark",
      type: "single",
      releaseDate: "2020-01-01",
      releaseAt: "2020-01-01T12:00:00.000Z",
      description: { en: "a", sv: "a" },
      cover: { src: "https://i.scdn.co/x", alt: { en: "a", sv: "a" }, placeholder: false },
      streamingLinks: {},
      trackIds: [],
      featured: false,
      status: "published",
    },
    {
      id: "r-new",
      slug: "new",
      title: "New",
      artistId: "artist-frostmark",
      type: "single",
      releaseDate: "2024-01-01",
      releaseAt: "2024-01-01T12:00:00.000Z",
      description: { en: "a", sv: "a" },
      cover: { src: "https://i.scdn.co/y", alt: { en: "a", sv: "a" }, placeholder: false },
      streamingLinks: {},
      trackIds: [],
      featured: false,
      status: "published",
    },
  ];
  assert.equal(pickFeaturedReleaseId(releases, null), "r-new");
  assert.equal(pickFeaturedReleaseId(releases, "r-old"), "r-old");
}

function testDeterministicSlug() {
  const s1 = slugForSpotifyAlbum("Hej", "abc123XYZ789");
  const s2 = slugForSpotifyAlbum("Hej", "abc123XYZ789");
  assert.equal(s1, s2);
}

async function testImportPaginationAndIdempotency() {
  const frostId = "0edDVF0bL7PFu2Sc3ijDrP";
  const wolfId = "4B4kHkS5D9gK6Q3lNbDPml";
  const frostAlbum = mockAlbum("frostAlb1", frostId, "Frost Single");
  const wolfAlbum = mockAlbum("wolfAlb1", wolfId, "Wolf Single");
  wolfAlbum.artists = [{ id: wolfId, name: "Wolfyslayer" }];

  const fetchImpl = mockFetch({
    "/artists/0edDVF0bL7PFu2Sc3ijDrP/albums": () => ({
      items: [frostAlbum],
      total: 1,
      limit: 50,
      offset: 0,
      next: null,
    }),
    "/artists/4B4kHkS5D9gK6Q3lNbDPml/albums": () => ({
      items: [wolfAlbum],
      total: 1,
      limit: 50,
      offset: 0,
      next: null,
    }),
    "/albums/frostAlb1": () => ({
      ...frostAlbum,
      tracks: {
        items: [
          {
            id: "ft1",
            name: "Frost Track",
            track_number: 1,
            disc_number: 1,
            duration_ms: 180000,
            external_urls: { spotify: "https://open.spotify.com/track/ft1" },
            artists: [{ id: frostId, name: "Frostmark" }],
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
        next: null,
      },
    }),
    "/albums/wolfAlb1": () => ({
      ...wolfAlbum,
      tracks: {
        items: [
          {
            id: "wt1",
            name: "Wolf Track",
            track_number: 1,
            disc_number: 1,
            duration_ms: 200000,
            external_urls: { spotify: "https://open.spotify.com/track/wt1" },
            artists: [{ id: wolfId, name: "Wolfyslayer" }],
          },
        ],
        total: 1,
        limit: 50,
        offset: 0,
        next: null,
      },
    }),
  });

  const first = await importSpotifyCatalog("token", { fetchImpl, http: { minDelayMs: 0, maxRetries: 1 } });
  assert.equal(first.stats.reduce((n, s) => n + s.albumsImported, 0), 2);
  assert.equal(first.tracks.length, 2);
  assert.ok(first.featuredReleaseId);

  const second = await importSpotifyCatalog("token", { fetchImpl, http: { minDelayMs: 0, maxRetries: 1 } });
  assert.equal(second.releases.length, first.releases.length);
  assert.deepEqual(
    second.releases.map((r) => r.spotifyAlbumId).sort(),
    first.releases.map((r) => r.spotifyAlbumId).sort(),
  );

  const plan = planImportWrites(first);
  assert.ok(plan.writes.length > 0);
  assert.ok(plan.removes.some((p) => p.includes("frostmark-placeholder-release.json")));
}

async function testRateLimitRetry() {
  let albumAttempts = 0;
  const frostId = "0edDVF0bL7PFu2Sc3ijDrP";
  const wolfId = "4B4kHkS5D9gK6Q3lNbDPml";
  const fetchImpl: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes("accounts.spotify.com")) {
      return new Response(JSON.stringify({ access_token: "t", token_type: "Bearer", expires_in: 60 }), {
        status: 200,
      });
    }
    if (url.includes(`/albums/retryAlb`)) {
      if (url.includes("/tracks")) {
        return new Response(
          JSON.stringify({ items: [], total: 0, limit: 50, offset: 0, next: null }),
          { status: 200 },
        );
      }
      albumAttempts += 1;
      if (albumAttempts === 1) {
        return new Response("slow down", { status: 429, headers: { "Retry-After": "0" } });
      }
      return new Response(
        JSON.stringify({
          ...mockAlbum("retryAlb", frostId, "Retry"),
          tracks: { items: [], total: 0, limit: 50, offset: 0, next: null },
        }),
        { status: 200 },
      );
    }
    if (url.includes(`/artists/${frostId}/albums`)) {
      return new Response(
        JSON.stringify({
          items: [mockAlbum("retryAlb", frostId, "Retry")],
          total: 1,
          limit: 50,
          offset: 0,
          next: null,
        }),
        { status: 200 },
      );
    }
    if (url.includes(`/artists/${wolfId}/albums`)) {
      return new Response(
        JSON.stringify({ items: [], total: 0, limit: 50, offset: 0, next: null }),
        { status: 200 },
      );
    }
    return new Response("nope", { status: 500 });
  };

  const result = await importSpotifyCatalog("token", {
    fetchImpl,
    http: { minDelayMs: 0, maxRetries: 3 },
  });
  assert.ok(albumAttempts >= 2);
  assert.ok(result.releases.some((r) => r.spotifyAlbumId === "retryAlb"));
}

function testArtistAlbumsPageLimitConstant() {
  assert.equal(SPOTIFY_ARTIST_ALBUMS_PAGE_LIMIT, 10);
  assert.ok(SPOTIFY_ARTIST_ALBUMS_PAGE_LIMIT <= 10);
}

async function testArtistAlbumsRequestUsesValidLimit() {
  let capturedLimit = "";
  const fetchImpl: typeof fetch = async (input) => {
    const url = String(input);
    capturedLimit = new URL(url).searchParams.get("limit") ?? "";
    return new Response(
      JSON.stringify({ items: [], total: 0, limit: 10, offset: 0, next: null }),
      { status: 200 },
    );
  };
  await fetchArtistAlbumsPage("token", "0edDVF0bL7PFu2Sc3ijDrP", 0, SPOTIFY_ARTIST_ALBUMS_PAGE_LIMIT, {
    fetchImpl,
  });
  assert.equal(capturedLimit, "10");
}

async function main() {
  testArtistAlbumsPageLimitConstant();
  await testArtistAlbumsRequestUsesValidLimit();
  testAuthMissing();
  testDates();
  testDedupe();
  testOwnership();
  testTrackOrdering();
  testFeaturedPick();
  testDeterministicSlug();
  await testImportPaginationAndIdempotency();
  await testRateLimitRetry();
  console.log("Spotify import tests: all passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
