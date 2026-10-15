import type { Release, StreamingPlatform } from "@/lib/types/content";
import { getConfiguredStreamingLinks, platformLabels } from "@/lib/utils/streaming";
import { isValidHttpUrl } from "@/lib/utils/url";

const hubOrder: StreamingPlatform[] = [
  "spotify",
  "appleMusic",
  "youtubeMusic",
  "bandcamp",
  "soundcloud",
  "deezer",
  "tidal",
];

/** Streaming destinations for the release hub (only validated URLs). */
export function getReleaseHubStreaming(release: Release) {
  const merged = { ...release.streamingLinks };
  if (isValidHttpUrl(release.spotifyAlbumUrl) && !merged.spotify) {
    merged.spotify = release.spotifyAlbumUrl!;
  }

  const configured = getConfiguredStreamingLinks(merged).filter((l) => isValidHttpUrl(l.url));

  const orderIndex = new Map(hubOrder.map((p, i) => [p, i]));
  return configured.sort(
    (a, b) => (orderIndex.get(a.platform) ?? 99) - (orderIndex.get(b.platform) ?? 99),
  );
}

export function getReleaseHubPreSaveUrl(release: Release): string | null {
  return isValidHttpUrl(release.preSaveUrl) ? release.preSaveUrl!.trim() : null;
}

export { platformLabels };
