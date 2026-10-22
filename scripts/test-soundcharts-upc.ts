#!/usr/bin/env tsx
/** Read the existing Spotify identifier CSV and test Soundcharts UPC lookup.
 * Diagnostic only: never modifies the music catalog.
 */
import { readFileSync, writeFileSync } from "node:fs";
function parseCsv(source: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && source[i + 1] === "\n") i++;
      row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const safe = (value: unknown) => String(value ?? "").replaceAll("|", "\\|").replace(/[\r\n]/g, " ").slice(0, 120);
async function main() {
  const id = process.env.SOUNDCHARTS_CLIENT_ID;
  const secret = process.env.SOUNDCHARTS_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Missing Soundcharts credentials in GitHub Actions secrets");
  const data = parseCsv(readFileSync("spotify-identifiers.csv", "utf8").replace(/^\uFEFF/, ""));
  const header = data.shift() ?? [];
  const upcColumn = header.indexOf("upc"), artistColumn = header.indexOf("artist"), releaseColumn = header.indexOf("release");
  if (upcColumn < 0 || artistColumn < 0 || releaseColumn < 0) throw new Error("Unexpected CSV headers");
  const seen = new Set<string>();
  const releases = data.filter(row => {
    const upc = row[upcColumn]?.trim();
    if (!upc || seen.has(upc)) return false;
    seen.add(upc); return true;
  }).slice(0, 3);
  const basic = Buffer.from(id + ":" + secret).toString("base64");
  const auth = await fetch("https://account.soundcharts.com/oauth/token", {
    method: "POST",
    headers: { Authorization: "Basic " + basic, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });
  if (!auth.ok) throw new Error("Soundcharts OAuth failed HTTP " + auth.status);
  const token = (await auth.json() as { access_token?: string }).access_token;
  if (!token) throw new Error("Soundcharts OAuth response did not contain access_token");
  const lines = ["# Soundcharts UPC diagnostic", "", "Read-only test of three unique UPCs. No catalog changes.", "", "| Artist | Release | UPC | Result | Soundcharts UUID |", "|---|---|---|---|---|"];
  for (const row of releases) {
    const upc = row[upcColumn];
    const response = await fetch("https://customer.api.soundcharts.com/api/v2.51/album/by-upc/" + encodeURIComponent(upc), {
      headers: { Authorization: "Bearer " + token }
    });
    let status = "HTTP " + response.status, uuid = "";
    if (response.ok) {
      const payload = await response.json() as { object?: { uuid?: string; upc?: string }; uuid?: string };
      const album = payload.object ?? payload;
      uuid = album.uuid ?? "";
      status = album.upc && album.upc !== upc ? "UPC mismatch — review" : "Found";
    } else if (response.status === 403) status = "403 — endpoint not included in plan";
    else if (response.status === 404) status = "404 — not in Soundcharts";
    lines.push("| " + [safe(row[artistColumn]), safe(row[releaseColumn]), safe(upc), status, safe(uuid)].join(" | ") + " |");
    console.log("UPC lookup: " + status);
    if (response.status === 401 || response.status === 403 || response.status === 429) break;
  }
  writeFileSync("soundcharts-upc-report.md", lines.join("\n") + "\n");
  console.log("Soundcharts diagnostic report generated.");
}
main().catch(error => { console.error(String(error)); process.exitCode = 1; });
