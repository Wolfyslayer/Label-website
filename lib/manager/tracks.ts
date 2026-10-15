import { slugify, trackSlug, uniqueId } from "@/lib/manager/slugs";
import type { TrackForm } from "@/lib/manager/types";

export function reorderTracks(list: TrackForm[], index: number, direction: -1 | 1): TrackForm[] {
  const next = [...list];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return renumberTracks(next);
}

export function renumberTracks(list: TrackForm[]): TrackForm[] {
  return list.map((t, i) => ({ ...t, trackNumber: i + 1 }));
}

export function createTrackDraft(
  releaseId: string,
  releaseSlug: string,
  artistId: string,
  title: string,
  index: number,
): TrackForm {
  const slug = trackSlug(title || `track-${index + 1}`, releaseSlug, index);
  return {
    id: uniqueId("track"),
    slug,
    title: title || `Track ${index + 1}`,
    artistId,
    releaseId,
    trackNumber: index + 1,
  };
}

export function syncReleaseTrackIds(releaseId: string, tracks: TrackForm[]): string[] {
  return tracks.filter((t) => t.releaseId === releaseId).sort((a, b) => a.trackNumber - b.trackNumber).map((t) => t.id);
}

export function parseDurationInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const m = /^(\d+):(\d{1,2})$/.exec(trimmed);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  return undefined;
}

export function slugFromTitle(title: string, fallback: string): string {
  return slugify(title) || fallback;
}
