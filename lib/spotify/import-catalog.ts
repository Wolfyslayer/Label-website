import { join } from "node:path";
import { loadContentFromFiles } from "@/lib/content/load-files";
import {
  SPOTIFY_LABEL_ARTISTS,
  type LabelSpotifyArtistKey,
} from "@/lib/spotify/constants";
import { dedupeSpotifyAlbums } from "@/lib/spotify/dedupe";
import { fetchAllAlbumTracks, fetchAllArtistAlbums, fetchAlbumWithTracks } from "@/lib/spotify/api";
import { albumBelongsToSpotifyArtist } from "@/lib/spotify/ownership";
import {
  extractSpotifyAlbumIdFromRelease,
  extractSpotifyTrackIdFromTrack,
  mapAlbumToRelease,
  mapSpotifyTracksToContent,
  releaseIdForSpotifyAlbum,
} from "@/lib/spotify/map-content";
import type { FetchLike } from "@/lib/spotify/types";
import type { ReleaseSource, SiteContentSource, Track } from "@/lib/types/content";
import type { SpotifyHttpOptions } from "@/lib/spotify/http";
import { pickFeaturedReleaseId } from "@/lib/content/featured-release";

export type ImportArtistStats = {
  key: LabelSpotifyArtistKey;
  spotifyArtistId: string;
  albumsFetched: number;
  albumsImported: number;
  tracksImported: number;
  skippedNotOwned: number;
};

export type ImportCatalogResult = {
  releases: ReleaseSource[];
  tracks: Track[];
  removedReleaseIds: string[];
  removedTrackIds: string[];
  featuredReleaseId: string | null;
  stats: ImportArtistStats[];
  reportLines: string[];
};

function indexExistingBySpotifyAlbum(source: SiteContentSource): Map<string, ReleaseSource> {
  const map = new Map<string, ReleaseSource>();
  for (const r of source.releases) {
    const sid = extractSpotifyAlbumIdFromRelease(r);
    if (sid) map.set(sid, r);
  }
  return map;
}

function indexExistingTracksBySpotifyId(tracks: Track[]): Map<string, Track> {
  const map = new Map<string, Track>();
  for (const t of tracks) {
    const sid = extractSpotifyTrackIdFromTrack(t);
    if (sid) map.set(sid, t);
  }
  return map;
}

export async function importSpotifyCatalog(
  accessToken: string,
  options: { fetchImpl?: FetchLike; http?: SpotifyHttpOptions } = {},
): Promise<ImportCatalogResult> {
  const source = loadContentFromFiles();
  const existingByAlbumId = indexExistingBySpotifyAlbum(source);
  const existingTracksBySpotifyId = indexExistingTracksBySpotifyId(source.tracks);

  const httpOpts: SpotifyHttpOptions = {
    fetchImpl: options.fetchImpl,
    ...options.http,
  };

  const importedReleaseIds = new Set<string>();
  const releases: ReleaseSource[] = [];
  const tracks: Track[] = [];
  const stats: ImportArtistStats[] = [];
  const reportLines: string[] = [];

  for (const key of Object.keys(SPOTIFY_LABEL_ARTISTS) as LabelSpotifyArtistKey[]) {
    const cfg = SPOTIFY_LABEL_ARTISTS[key];
    const artistStats: ImportArtistStats = {
      key,
      spotifyArtistId: cfg.spotifyArtistId,
      albumsFetched: 0,
      albumsImported: 0,
      tracksImported: 0,
      skippedNotOwned: 0,
    };

    reportLines.push(`\n## ${cfg.name} (${cfg.spotifyArtistId})`);

    const rawAlbums = await fetchAllArtistAlbums(accessToken, cfg.spotifyArtistId, httpOpts);
    const albums = dedupeSpotifyAlbums(rawAlbums);
    artistStats.albumsFetched = albums.length;
    reportLines.push(`Fetched ${rawAlbums.length} album rows, ${albums.length} after dedupe.`);

    for (const simplified of albums) {
      if (!albumBelongsToSpotifyArtist(simplified, cfg.spotifyArtistId)) {
        artistStats.skippedNotOwned += 1;
        continue;
      }

      const full = await fetchAlbumWithTracks(accessToken, simplified.id, httpOpts);
      const trackItems =
        full.tracks?.items?.length >= full.total_tracks
          ? full.tracks.items
          : await fetchAllAlbumTracks(accessToken, simplified.id, httpOpts);

      const existing = existingByAlbumId.get(simplified.id);
      const releaseId = existing?.id ?? releaseIdForSpotifyAlbum(simplified.id);
      const mappedTracks = mapSpotifyTracksToContent(
        full,
        trackItems,
        cfg.contentArtistId,
        releaseId,
        cfg.spotifyArtistId,
        existingTracksBySpotifyId,
      );

      const release = mapAlbumToRelease(
        full,
        cfg.contentArtistId,
        cfg.name,
        cfg.spotifyArtistId,
        mappedTracks.map((t) => t.id),
        existing,
      );

      releases.push(release);
      tracks.push(...mappedTracks);
      importedReleaseIds.add(release.id);
      artistStats.albumsImported += 1;
      artistStats.tracksImported += mappedTracks.length;
      reportLines.push(
        `  + ${release.title} (${release.type}) — ${mappedTracks.length} track(s) [${release.spotifyAlbumId}]`,
      );
    }

    stats.push(artistStats);
  }

  const placeholderIds = new Set([
    "release-frostmark-placeholder-01",
    "release-wolfyslayer-upcoming-01",
  ]);
  const keptManual = source.releases.filter(
    (r) =>
      !placeholderIds.has(r.id) &&
      !importedReleaseIds.has(r.id) &&
      r.importSource !== "spotify" &&
      !extractSpotifyAlbumIdFromRelease(r),
  );

  if (keptManual.length) {
    reportLines.push(`\nPreserved ${keptManual.length} manual release(s) without Spotify album id.`);
    for (const r of keptManual) {
      releases.push(r);
      importedReleaseIds.add(r.id);
      const manualTracks = source.tracks.filter((t) => t.releaseId === r.id);
      tracks.push(...manualTracks);
    }
  }

  const removedReleaseIds = [...placeholderIds];
  const removedTrackIds = ["track-frostmark-01"];

  const featuredReleaseId = pickFeaturedReleaseId(releases, null);

  reportLines.push(
    `\nFeatured release: ${featuredReleaseId ?? "(none — catalog empty or all upcoming)"}`,
  );
  reportLines.push(
    `Totals: ${releases.length} releases, ${tracks.length} tracks (${stats.reduce((n, s) => n + s.albumsImported, 0)} from Spotify).`,
  );

  return {
    releases,
    tracks,
    removedReleaseIds,
    removedTrackIds: [...new Set([...removedTrackIds, "track-frostmark-01"])],
    featuredReleaseId,
    stats,
    reportLines,
  };
}

export function contentDir(): string {
  return join(process.cwd(), "content");
}
