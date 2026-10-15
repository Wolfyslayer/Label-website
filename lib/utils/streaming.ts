import type { Release, StreamingLinks, StreamingPlatform, Track } from "@/lib/types/content";

export const platformLabels: Record<StreamingPlatform, string> = {
  spotify: "Spotify",
  appleMusic: "Apple Music",
  youtubeMusic: "YouTube Music",
  bandcamp: "Bandcamp",
  soundcloud: "Soundcloud",
  deezer: "Deezer",
  tidal: "Tidal",
};

export function getConfiguredStreamingLinks(links: StreamingLinks) {
  return (Object.entries(links) as [StreamingPlatform, string | undefined][])
    .filter(([, url]) => Boolean(url?.trim()))
    .map(([platform, url]) => ({
      platform,
      label: platformLabels[platform],
      url: url!,
    }));
}

export function spotifyEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("spotify.com")) return null;
    const path = parsed.pathname.replace("/embed/", "/");
    if (!path.includes("/album/") && !path.includes("/track/")) return null;
    return `https://open.spotify.com/embed${path}?utm_source=generator&theme=0`;
  } catch {
    return null;
  }
}

export function getReleaseSpotifyUrl(release: Release, tracks?: Track[]): string | undefined {
  const fromTracks = tracks?.find((tr) => tr.spotifyTrackUrl?.trim())?.spotifyTrackUrl;
  return (
    release.spotifyAlbumUrl?.trim() ||
    release.streamingLinks.spotify?.trim() ||
    fromTracks?.trim() ||
    undefined
  );
}

export function spotifyArtistEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/artist\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    return `https://open.spotify.com/embed/artist/${match[1]}?utm_source=generator&theme=0`;
  } catch {
    return null;
  }
}
