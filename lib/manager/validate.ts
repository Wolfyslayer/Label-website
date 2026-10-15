import {
  artistSourceSchema,
  newsFrontmatterSchema,
  releaseSourceSchema,
  trackSchema,
} from "@/lib/content/schemas";
import type { ValidationIssue } from "@/lib/manager/types";
import type { z } from "zod";

function zodIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "form",
    message: issue.message,
  }));
}

export function validateRelease(data: unknown) {
  const parsed = releaseSourceSchema.safeParse(data);
  return parsed.success ? { ok: true as const, data: parsed.data } : { ok: false as const, issues: zodIssues(parsed.error) };
}

export function validateTrack(data: unknown) {
  const parsed = trackSchema.safeParse(data);
  return parsed.success ? { ok: true as const, data: parsed.data } : { ok: false as const, issues: zodIssues(parsed.error) };
}

export function validateArtist(data: unknown) {
  const parsed = artistSourceSchema.safeParse(data);
  return parsed.success ? { ok: true as const, data: parsed.data } : { ok: false as const, issues: zodIssues(parsed.error) };
}

export function validateNews(data: unknown) {
  const parsed = newsFrontmatterSchema.safeParse(data);
  return parsed.success ? { ok: true as const, data: parsed.data } : { ok: false as const, issues: zodIssues(parsed.error) };
}

export function validateWorkspace(releases: unknown[], tracks: unknown[], artists: unknown[], news: unknown[]) {
  const issues: ValidationIssue[] = [];
  for (const [i, r] of releases.entries()) {
    const v = validateRelease(r);
    if (!v.ok) issues.push(...v.issues.map((x) => ({ field: `release[${i}].${x.field}`, message: x.message })));
  }
  for (const [i, t] of tracks.entries()) {
    const v = validateTrack(t);
    if (!v.ok) issues.push(...v.issues.map((x) => ({ field: `track[${i}].${x.field}`, message: x.message })));
  }
  for (const [i, a] of artists.entries()) {
    const v = validateArtist(a);
    if (!v.ok) issues.push(...v.issues.map((x) => ({ field: `artist[${i}].${x.field}`, message: x.message })));
  }
  for (const [i, n] of news.entries()) {
    const v = validateNews(n);
    if (!v.ok) issues.push(...v.issues.map((x) => ({ field: `news[${i}].${x.field}`, message: x.message })));
  }
  return issues;
}
