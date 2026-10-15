import type { SiteContentSource } from "@/lib/types/content";

export type LaunchWarning = {
  code: string;
  path: string;
  message: string;
};

const PLACEHOLDER_MARKERS = /\[placeholder|\[platshållare|\[upcoming — placeholder/i;

/** Non-blocking launch readiness hints for owners (does not fail the build). */
export function collectLaunchWarnings(source: SiteContentSource): LaunchWarning[] {
  const warnings: LaunchWarning[] = [];

  for (const release of source.releases) {
    if (release.status !== "published") continue;
    if (PLACEHOLDER_MARKERS.test(release.title)) {
      warnings.push({
        code: "placeholder_release_title",
        path: `content/releases/${release.slug}.json`,
        message: `Published release title still contains placeholder markers: "${release.title}"`,
      });
    }
    if (release.cover.placeholder) {
      warnings.push({
        code: "placeholder_release_artwork",
        path: `content/releases/${release.slug}.json`,
        message: "Release cover is marked placeholder — replace artwork before external promotion.",
      });
    }
    const hasStreaming = Object.values(release.streamingLinks ?? {}).some(
      (u) => typeof u === "string" && u.startsWith("https://"),
    );
    if (!hasStreaming && !release.spotifyAlbumUrl) {
      warnings.push({
        code: "missing_streaming_urls",
        path: `content/releases/${release.slug}.json`,
        message: "No streaming URLs configured for this published release.",
      });
    }
  }

  for (const artist of source.artists) {
    if (artist.status !== "published") continue;
    for (const field of [artist.shortBio.en, artist.shortBio.sv, artist.longBio.en, artist.longBio.sv]) {
      if (typeof field === "string" && PLACEHOLDER_MARKERS.test(field)) {
        warnings.push({
          code: "placeholder_artist_bio",
          path: `content/artists/${artist.slug}.json`,
          message: `Artist "${artist.name}" biography still contains placeholder copy.`,
        });
        break;
      }
    }
  }

  if (source.featuredReleaseId) {
    const featured = source.releases.find((r) => r.id === source.featuredReleaseId);
    if (featured?.cover.placeholder || PLACEHOLDER_MARKERS.test(featured?.title ?? "")) {
      warnings.push({
        code: "featured_release_placeholder",
        path: "content/site.json",
        message: "featuredReleaseId points at a placeholder release — homepage spotlight will show draft-style content.",
      });
    }
  }

  const draftNews = source.news.filter((n) => n.status === "draft");
  if (draftNews.length) {
    warnings.push({
      code: "draft_news_present",
      path: "content/news/",
      message: `${draftNews.length} draft news file(s) in repo (not public until status: published).`,
    });
  }

  return warnings;
}
