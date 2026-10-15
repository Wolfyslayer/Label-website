import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  PLACEHOLDER_RELEASE_FILES,
  PLACEHOLDER_TRACK_FILES,
} from "@/lib/spotify/constants";
import type { ImportCatalogResult } from "@/lib/spotify/import-catalog";
import { contentDir } from "@/lib/spotify/import-catalog";
import { releaseSourceSchema, siteMetaSchema, trackSchema } from "@/lib/content/schemas";
import type { ReleaseSource, Track } from "@/lib/types/content";

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function readSiteJson(): Record<string, unknown> {
  const path = join(contentDir(), "site.json");
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function releaseFileName(release: ReleaseSource): string {
  return `${release.slug}.json`;
}

function trackFileName(track: Track): string {
  return `${track.slug}.json`;
}

function listManagedReleaseFiles(): string[] {
  const dir = join(contentDir(), "releases");
  return readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
}

function listManagedTrackFiles(): string[] {
  const dir = join(contentDir(), "tracks");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
}

export type WriteImportOptions = {
  dryRun?: boolean;
};

export type WriteImportResult = {
  dryRun: boolean;
  filesWritten: string[];
  filesRemoved: string[];
  siteUpdated: boolean;
};

export function planImportWrites(result: ImportCatalogResult): {
  writes: { path: string; content: string }[];
  removes: string[];
  sitePath: string | null;
} {
  const writes: { path: string; content: string }[] = [];

  for (const release of result.releases) {
    const parsed = releaseSourceSchema.safeParse(release);
    if (!parsed.success) {
      const detail = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Invalid release "${release.title}" (${release.id}): ${detail}`);
    }
    writes.push({
      path: join("content", "releases", releaseFileName(release)),
      content: stableJson(release),
    });
  }

  for (const track of result.tracks) {
    const parsedTrack = trackSchema.safeParse(track);
    if (!parsedTrack.success) {
      const detail = parsedTrack.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Invalid track "${track.title}" (${track.id}): ${detail}`);
    }
    writes.push({
      path: join("content", "tracks", trackFileName(track)),
      content: stableJson(track),
    });
  }

  const nextSite = readSiteJson();
  nextSite.featuredReleaseId = result.featuredReleaseId;
  siteMetaSchema.parse(nextSite);
  const sitePath = join("content", "site.json");
  writes.push({ path: sitePath, content: stableJson(nextSite) });

  const keepReleaseFiles = new Set(result.releases.map((r) => releaseFileName(r)));
  const keepTrackFiles = new Set(result.tracks.map((t) => trackFileName(t)));

  // Only known seed placeholders are eligible for automatic deletion.
  // Manual and previously imported catalog files must be removed by an owner-reviewed PR.
  const removes: string[] = [];
  for (const f of listManagedReleaseFiles()) {
    if (PLACEHOLDER_RELEASE_FILES.includes(f as (typeof PLACEHOLDER_RELEASE_FILES)[number]) && !keepReleaseFiles.has(f)) {
      removes.push(join("content", "releases", f));
    }
  }
  for (const f of listManagedTrackFiles()) {
    if (PLACEHOLDER_TRACK_FILES.includes(f as (typeof PLACEHOLDER_TRACK_FILES)[number]) && !keepTrackFiles.has(f)) {
      removes.push(join("content", "tracks", f));
    }
  }

  return { writes, removes, sitePath };
}

export function applyImportWrites(
  result: ImportCatalogResult,
  options: WriteImportOptions = {},
): WriteImportResult {
  const { writes, removes } = planImportWrites(result);
  const dryRun = options.dryRun ?? false;
  const filesWritten: string[] = [];
  const filesRemoved: string[] = [];

  if (dryRun) {
    return {
      dryRun: true,
      filesWritten: writes.map((w) => w.path),
      filesRemoved: removes,
      siteUpdated: writes.some((w) => w.path.endsWith("site.json")),
    };
  }

  mkdirSync(join(contentDir(), "tracks"), { recursive: true });

  for (const { path, content } of writes) {
    const abs = join(process.cwd(), path);
    const prev = existsSync(abs) ? readFileSync(abs, "utf8") : null;
    if (prev === content) continue;
    writeFileSync(abs, content, "utf8");
    filesWritten.push(path);
  }

  for (const path of removes) {
    const abs = join(process.cwd(), path);
    if (existsSync(abs)) {
      rmSync(abs);
      filesRemoved.push(path);
    }
  }

  return {
    dryRun: false,
    filesWritten,
    filesRemoved,
    siteUpdated: filesWritten.some((p) => p.endsWith("site.json")),
  };
}
