#!/usr/bin/env tsx
/**
 * Apply format-valid MusicLink lookup results to the exact Spotify track IDs.
 * No inferred matches by title or shared ISRC; no streaming URLs are changed.
 * Default: dry run. Pass --apply to write catalog files.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Track } from "../lib/types/content";

const apply = process.argv.includes("--apply");
const source = readFileSync("scripts/data/musiclink-isrc-reviewed.txt", "utf8");
const matches = new Map<string, string>();
for (const row of source.trim().split(/\r?\n/)) {
  const [spotifyId, isrc] = row.trim().split(/\s+/);
  if (!/^[a-zA-Z0-9]{22}$/.test(spotifyId) || !/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(isrc)) {
    throw new Error("Invalid mapping: " + row);
  }
  if (matches.has(spotifyId)) throw new Error("Duplicate Spotify ID: " + spotifyId);
  matches.set(spotifyId, isrc);
}
let updated = 0, unchanged = 0, conflicts = 0;
const seen = new Set<string>();
const dir = join(process.cwd(), "content/tracks");
for (const file of readdirSync(dir).filter(f => f.endsWith(".json") && !f.startsWith("_"))) {
  const path = join(dir, file);
  const track = JSON.parse(readFileSync(path, "utf8")) as Track;
  const id = track.spotifyTrackId;
  if (!id || !matches.has(id)) continue;
  seen.add(id);
  const isrc = matches.get(id)!;
  if (track.isrc && track.isrc !== isrc) {
    console.warn("CONFLICT " + file + ": existing " + track.isrc + ", candidate " + isrc);
    conflicts++;
    continue;
  }
  if (track.isrc === isrc) { unchanged++; continue; }
  updated++;
  if (apply) {
    track.isrc = isrc;
    writeFileSync(path, JSON.stringify(track, null, 2) + "\n");
  }
}
const missing = [...matches.keys()].filter(id => !seen.has(id));
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", matches: matches.size, updated, unchanged, conflicts, missing }, null, 2));
if (conflicts || missing.length) process.exitCode = 1;
