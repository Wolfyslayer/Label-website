import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadContentFromFiles } from "@/lib/content/load-files";
import type { SiteContentSource } from "@/lib/types/content";

export type ContentValidationIssue = {
  path: string;
  message: string;
};

function collectIds(source: SiteContentSource) {
  const issues: ContentValidationIssue[] = [];
  const idSets = [
    { name: "artist", ids: source.artists.map((a) => a.id) },
    { name: "release", ids: source.releases.map((r) => r.id) },
    { name: "track", ids: source.tracks.map((t) => t.id) },
    { name: "news", ids: source.news.map((n) => n.id) },
  ];

  for (const { name, ids } of idSets) {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) issues.push({ path: name, message: `Duplicate id: ${id}` });
      seen.add(id);
    }
  }

  const slugCheck = [
    { name: "artist", slugs: source.artists.map((a) => a.slug) },
    { name: "release", slugs: source.releases.map((r) => r.slug) },
    { name: "news", slugs: source.news.map((n) => n.slug) },
  ];
  for (const { name, slugs } of slugCheck) {
    const seen = new Set<string>();
    for (const slug of slugs) {
      if (seen.has(slug)) issues.push({ path: name, message: `Duplicate slug: ${slug}` });
      seen.add(slug);
    }
  }

  return issues;
}

function validateReferences(source: SiteContentSource): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const artistIds = new Set(source.artists.map((a) => a.id));
  const releaseIds = new Set(source.releases.map((r) => r.id));
  const trackIds = new Set(source.tracks.map((t) => t.id));

  for (const release of source.releases) {
    if (!artistIds.has(release.artistId)) {
      issues.push({
        path: `release:${release.id}`,
        message: `Unknown artistId ${release.artistId}`,
      });
    }
    for (const tid of release.trackIds) {
      if (!trackIds.has(tid)) {
        issues.push({
          path: `release:${release.id}`,
          message: `Unknown trackId ${tid} in trackIds`,
        });
      }
    }
  }

  for (const track of source.tracks) {
    if (!artistIds.has(track.artistId)) {
      issues.push({ path: `track:${track.id}`, message: `Unknown artistId ${track.artistId}` });
    }
    if (!releaseIds.has(track.releaseId)) {
      issues.push({ path: `track:${track.id}`, message: `Unknown releaseId ${track.releaseId}` });
    }
  }

  for (const artist of source.artists) {
    for (const rid of artist.featuredReleaseIds ?? []) {
      if (!releaseIds.has(rid)) {
        issues.push({
          path: `artist:${artist.id}`,
          message: `Unknown featuredReleaseId ${rid}`,
        });
      }
    }
    for (const tid of artist.featuredTrackIds) {
      if (!trackIds.has(tid)) {
        issues.push({
          path: `artist:${artist.id}`,
          message: `Unknown featuredTrackId ${tid}`,
        });
      }
    }
  }

  for (const article of source.news) {
    if (article.artistId && !artistIds.has(article.artistId)) {
      issues.push({
        path: `news:${article.id}`,
        message: `Unknown artistId ${article.artistId}`,
      });
    }
    if (article.releaseId && !releaseIds.has(article.releaseId)) {
      issues.push({
        path: `news:${article.id}`,
        message: `Unknown releaseId ${article.releaseId}`,
      });
    }
  }

  if (source.featuredReleaseId && !releaseIds.has(source.featuredReleaseId)) {
    issues.push({
      path: "site.json",
      message: `featuredReleaseId ${source.featuredReleaseId} not found`,
    });
  }

  for (const nid of source.homepageFeaturedNewsIds) {
    if (!source.news.some((n) => n.id === nid)) {
      issues.push({
        path: "site.json",
        message: `homepageFeaturedNewsIds: unknown news id ${nid}`,
      });
    }
  }

  return issues;
}

function validateAssetPaths(source: SiteContentSource): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const publicRoot = join(process.cwd(), "public");

  function checkImage(context: string, id: string, src: string, placeholder: boolean) {
    if (placeholder) return;
    if (src.startsWith("https://")) return;
    const full = join(publicRoot, src.replace(/^\//, ""));
    if (!existsSync(full)) {
      issues.push({ path: `${context}:${id}`, message: `Missing artwork file public${src}` });
    }
  }

  for (const artist of source.artists) {
    checkImage("artist", artist.id, artist.image.src, artist.image.placeholder);
    if (artist.heroImage) {
      checkImage("artist", artist.id, artist.heroImage.src, artist.heroImage.placeholder);
    }
  }
  for (const release of source.releases) {
    checkImage("release", release.id, release.cover.src, release.cover.placeholder);
  }
  for (const article of source.news) {
    checkImage("news", article.id, article.cover.src, article.cover.placeholder);
  }
  for (const press of source.pressAssets) {
    if (!press.placeholder && press.src.startsWith("/")) {
      const full = join(publicRoot, press.src.replace(/^\//, ""));
      if (!existsSync(full)) {
        issues.push({ path: `press:${press.id}`, message: `Missing file public${press.src}` });
      }
    }
  }

  return issues;
}

function validateDates(source: SiteContentSource): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  for (const release of source.releases) {
    const d = new Date(release.releaseAt);
    if (Number.isNaN(d.getTime())) {
      issues.push({ path: `release:${release.id}`, message: "Invalid releaseAt" });
    }
    if (release.releaseDate !== release.releaseAt.slice(0, 10)) {
      issues.push({
        path: `release:${release.id}`,
        message: "releaseDate should match the calendar date in releaseAt (YYYY-MM-DD)",
      });
    }
  }
  return issues;
}

/** Validates content; throws if any critical issues exist. */
export function validateContentOrThrow(): SiteContentSource {
  let source: SiteContentSource;
  try {
    source = loadContentFromFiles();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`Content load failed: ${message}`);
  }

  const issues = [
    ...collectIds(source),
    ...validateReferences(source),
    ...validateAssetPaths(source),
    ...validateDates(source),
  ];

  if (issues.length) {
    const detail = issues.map((i) => `  [${i.path}] ${i.message}`).join("\n");
    throw new Error(`Content validation failed (${issues.length} issue(s)):\n${detail}`);
  }

  return source;
}
