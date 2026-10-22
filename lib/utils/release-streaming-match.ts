import type { ReleaseSource, Track } from "../types/content";

/**
 * Release-aware link matching. An ISRC identifies a recording, not the
 * single/album packaging. Never infer an album URL from an ISRC match alone.
 */
export interface StreamingCandidate {
  platform: string;
  url: string;
  artistId: string;
  releaseType: "single" | "ep" | "album";
  upc?: string;
  title?: string;
  trackIsrcs?: string[];
  trackCount?: number;
}

export type MatchResult =
  | { status: "verified"; reason: "upc_and_recordings" | "upc"; url: string }
  | { status: "review"; reason: string }
  | { status: "rejected"; reason: string };

const normalized = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function evaluateReleaseCandidate(
  release: ReleaseSource,
  tracks: Track[],
  candidate: StreamingCandidate,
): MatchResult {
  if (candidate.artistId !== release.artistId) return { status: "rejected", reason: "artist_mismatch" };
  if (candidate.releaseType !== release.type) return { status: "rejected", reason: "release_type_mismatch" };
  if (!/^https:\/\/[^\s]+$/.test(candidate.url)) return { status: "rejected", reason: "invalid_url" };
  if (candidate.title && normalized(candidate.title) !== normalized(release.title)) {
    return { status: "review", reason: "release_title_mismatch" };
  }
  if (candidate.trackCount !== undefined && candidate.trackCount !== release.trackIds.length) {
    return { status: "rejected", reason: "track_count_mismatch" };
  }
  const releaseUpc = release.upc?.trim();
  const candidateUpc = candidate.upc?.trim();
  if (!releaseUpc || !candidateUpc) return { status: "review", reason: "upc_not_verified" };
  if (releaseUpc !== candidateUpc) return { status: "rejected", reason: "upc_mismatch" };

  const expectedIsrcs = tracks.filter(t => release.trackIds.includes(t.id)).map(t => t.isrc).filter((s): s is string => !!s);
  const observedIsrcs = candidate.trackIsrcs ?? [];
  if (expectedIsrcs.length && observedIsrcs.length) {
    if (expectedIsrcs.length !== release.trackIds.length || observedIsrcs.length !== release.trackIds.length) return { status: "review", reason: "incomplete_recording_identifiers" };
    if (!expectedIsrcs.every(code => observedIsrcs.includes(code))) {
      return { status: "rejected", reason: "recording_mismatch" };
    }
    return { status: "verified", reason: "upc_and_recordings", url: candidate.url };
  }
  return { status: "verified", reason: "upc", url: candidate.url };
}
