import matter from "gray-matter";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  artistSourceSchema,
  newsFrontmatterSchema,
  releaseSourceSchema,
  siteMetaSchema,
  trackSchema,
} from "@/lib/content/schemas";
import type {
  ArtistSource,
  NewsArticleSource,
  ReleaseSource,
  SiteContentSource,
  Track,
} from "@/lib/types/content";

const CONTENT_DIR = join(process.cwd(), "content");

function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function listJsonFiles(dir: string, excludePrefix = "_"): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith(excludePrefix))
    .map((f) => join(dir, f));
}

function listNewsFiles(): string[] {
  const dir = join(CONTENT_DIR, "news");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => join(dir, f));
}

/** Load site content from `content/` for static GitHub Pages builds. */
export function loadContentFromFiles(): SiteContentSource {
  if (!existsSync(join(CONTENT_DIR, "site.json"))) {
    throw new Error("Missing content/site.json — see docs/CONTENT_MANAGEMENT.md");
  }

  const site = siteMetaSchema.parse(readJsonFile(join(CONTENT_DIR, "site.json")));

  const artists: ArtistSource[] = listJsonFiles(join(CONTENT_DIR, "artists")).map((file) =>
    artistSourceSchema.parse(readJsonFile(file)),
  );

  const releases: ReleaseSource[] = listJsonFiles(join(CONTENT_DIR, "releases")).map((file) =>
    releaseSourceSchema.parse(readJsonFile(file)),
  );

  const tracks: Track[] = listJsonFiles(join(CONTENT_DIR, "tracks")).map((file) =>
    trackSchema.parse(readJsonFile(file)),
  );

  const news: NewsArticleSource[] = listNewsFiles().map((file) => {
    const raw = readFileSync(file, "utf8");
    const { data } = matter(raw);
    return newsFrontmatterSchema.parse(data) as NewsArticleSource;
  });

  return {
    label: site.label,
    featuredReleaseId: site.featuredReleaseId,
    homepageFeaturedNewsIds: site.homepageFeaturedNewsIds,
    pressAssets: site.pressAssets,
    artists,
    releases,
    tracks,
    news,
  };
}
