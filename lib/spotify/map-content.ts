import { DEFAULT_RELEASE_DESCRIPTION } from "@/lib/spotify/constants";
import { parseSpotifyReleaseDate } from "@/lib/spotify/dates";
import { collaborationArtistNames } from "@/lib/spotify/ownership";
import type { SpotifyFullAlbum, SpotifySimplifiedAlbum } from "@/lib/spotify/types";
import { ensureContentSlug, isValidContentSlug } from "@/lib/manager/slugs";
import type { ReleaseSource, ReleaseType, Track } from "@/lib/types/content";

export function mapSpotifyAlbumType(albumType: string): ReleaseType {
  const t = albumType.toLowerCase();
  if (t === "single") return "single";
  if (t === "ep") return "ep";
  return "album";
}

export function releaseIdForSpotifyAlbum(spotifyAlbumId: string): string {
  return `release-spotify-${spotifyAlbumId}`;
}

export function trackIdForSpotifyTrack(spotifyTrackId: string): string {
  return `track-spotify-${spotifyTrackId}`;
}

export function slugForSpotifyAlbum(title: string, spotifyAlbumId: string, existingSlug?: string): string {
  if (existingSlug && isValidContentSlug(existingSlug)) return existingSlug;
  return ensureContentSlug(title, "release", spotifyAlbumId);
}

export function trackSlugForTitle(title: string, spotifyTrackId: string, existingSlug?: string): string {
  if (existingSlug && isValidContentSlug(existingSlug)) return existingSlug;
  return ensureContentSlug(title, "track", spotifyTrackId);
}

export function pickCoverUrl(album: SpotifySimplifiedAlbum): string | null {
  const img = album.images?.[0];
  return img?.url?.startsWith("https://") ? img.url : null;
}

function buildDescription(
  album: SpotifySimplifiedAlbum,
  labelArtistName: string,
  spotifyArtistId: string,
  existing?: ReleaseSource["description"],
): ReleaseSource["description"] {
  if (existing && !descriptionsEqual(existing, DEFAULT_RELEASE_DESCRIPTION)) {
    return existing;
  }
  const collabs = collaborationArtistNames(album, spotifyArtistId);
  if (collabs.length) {
    return {
      en: `Official ${labelArtistName} release on Spotify, with ${collabs.join(", ")}.`,
      sv: `Officiell ${labelArtistName}-release på Spotify, med ${collabs.join(", ")}.`,
    };
  }
  return { ...DEFAULT_RELEASE_DESCRIPTION };
}

function descriptionsEqual(a: ReleaseSource["description"], b: ReleaseSource["description"]): boolean {
  return a.en === b.en && a.sv === b.sv;
}

export function mapAlbumToRelease(
  album: SpotifyFullAlbum | SpotifySimplifiedAlbum,
  contentArtistId: string,
  labelArtistName: string,
  spotifyArtistId: string,
  trackIds: string[],
  existing?: ReleaseSource,
): ReleaseSource {
  const spotifyAlbumId = album.id;
  const id = existing?.id ?? releaseIdForSpotifyAlbum(spotifyAlbumId);
  const slug = slugForSpotifyAlbum(album.name, spotifyAlbumId, existing?.slug);
  const { releaseDate, releaseAt, releaseDatePrecision } = parseSpotifyReleaseDate(
    album.release_date,
    album.release_date_precision,
  );
  const coverUrl = pickCoverUrl(album);
  if (!coverUrl) {
    throw new Error(`Album "${album.name}" (${spotifyAlbumId}) has no HTTPS cover artwork from Spotify.`);
  }

  const spotifyAlbumUrl =
    album.external_urls?.spotify ?? `https://open.spotify.com/album/${spotifyAlbumId}`;

  return {
    id,
    slug,
    title: album.name,
    artistId: contentArtistId,
    type: mapSpotifyAlbumType(album.album_type),
    releaseDate,
    releaseAt,
    releaseDatePrecision,
    description: buildDescription(album, labelArtistName, spotifyArtistId, existing?.description),
    credits: existing?.credits,
    cover: {
      src: coverUrl,
      alt: {
        en: `${album.name} — cover artwork`,
        sv: `${album.name} — omslagsbild`,
      },
      placeholder: false,
    },
    streamingLinks: {
      ...existing?.streamingLinks,
      spotify: spotifyAlbumUrl,
    },
    spotifyAlbumUrl,
    spotifyAlbumId,
    upc: ("external_ids" in album && /^\\d{12,14}$/.test(album.external_ids?.upc ?? "") ? album.external_ids?.upc : undefined) ?? existing?.upc,
    trackIds,
    featured: existing?.featured ?? false,
    status: "published",
    preSaveUrl: existing?.preSaveUrl,
    importSource: "spotify",
  };
}

export function mapSpotifyTracksToContent(
  album: SpotifyFullAlbum,
  tracks: SpotifyFullAlbum["tracks"]["items"],
  contentArtistId: string,
  releaseId: string,
  spotifyArtistId: string,
  existingBySpotifyId: Map<string, Track>,
): Track[] {
  const sorted = [...tracks].sort((a, b) => {
    if (a.disc_number !== b.disc_number) return a.disc_number - b.disc_number;
    return a.track_number - b.track_number;
  });

  let globalIndex = 0;
  return sorted.map((t) => {
    globalIndex += 1;
    const existing = existingBySpotifyId.get(t.id);
    const spotifyTrackUrl = t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`;
    const durationSeconds = t.duration_ms > 0 ? Math.round(t.duration_ms / 1000) : undefined;
    return {
      id: existing?.id ?? trackIdForSpotifyTrack(t.id),
      slug: trackSlugForTitle(t.name, t.id, existing?.slug),
      title: t.name,
      artistId: contentArtistId,
      releaseId,
      trackNumber: globalIndex,
      discNumber: t.disc_number,
      durationSeconds,
      spotifyTrackUrl,
      spotifyTrackId: t.id,
      youtubeMusicTrackUrl: existing?.youtubeMusicTrackUrl,
      isrc: existing?.isrc,
    };
  });
}

export function extractSpotifyAlbumIdFromRelease(release: ReleaseSource): string | null {
  if (release.spotifyAlbumId) return release.spotifyAlbumId;
  const url = release.spotifyAlbumUrl ?? release.streamingLinks.spotify;
  if (!url) return null;
  const m = url.match(/\/album\/([a-zA-Z0-9]+)/);
  return m?.[1] ?? null;
}

export function extractSpotifyTrackIdFromTrack(track: Track): string | null {
  if (track.spotifyTrackId) return track.spotifyTrackId;
  const url = track.spotifyTrackUrl;
  if (!url) return null;
  const m = url.match(/\/track\/([a-zA-Z0-9]+)/);
  return m?.[1] ?? null;
}
