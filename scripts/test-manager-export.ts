import assert from "node:assert/strict";
import { buildExportZip } from "../lib/manager/export";
import { newsToMarkdown } from "../lib/manager/news-markdown";
import { createEmptyNews } from "../lib/manager/news-factory";
import { validateNews } from "../lib/manager/validate";
import { createEmptyRelease } from "../lib/manager/release-factory";
import { createTrackDraft } from "../lib/manager/tracks";
import { validateRelease } from "../lib/manager/validate";
import type { ManagerWorkspace } from "../lib/manager/types";

async function main() {
  const release = createEmptyRelease("single", "frostmark", "Test Export Single");
  release.description = { en: "English description for test.", sv: "Svensk beskrivning för test." };
  release.status = "draft";
  const v = validateRelease(release);
  assert.equal(v.ok, true, "release should validate");

  const track = createTrackDraft(release.id, release.slug, release.artistId, "Test Track", 0);
  release.trackIds = [track.id];

  const workspace: ManagerWorkspace = {
    releases: [release],
    tracks: [track],
    artists: [],
    news: [],
    artwork: [],
  };

  const built = await buildExportZip(workspace);
  assert.equal(built.issues.length, 0, `issues: ${JSON.stringify(built.issues)}`);
  assert.ok(built.zipBlob, "zip blob");
  assert.ok(built.manifest.some((m) => m.path.includes("content/releases/")));
  assert.ok(built.manifest.some((m) => m.path.includes("content/tracks/")));

  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(await built.zipBlob!.arrayBuffer());
  const releaseFile = Object.keys(zip.files).find((f) => f.includes("content/releases/") && !f.endsWith("/"));
  assert.ok(releaseFile, `keys: ${Object.keys(zip.files).join(",")}`);
  const entry = zip.file(releaseFile!);
  assert.ok(entry);
  const json = JSON.parse(await entry.async("string"));
  assert.equal(json.slug, release.slug);

  const news = createEmptyNews();
  news.title = { en: "News EN", sv: "News SV" };
  news.excerpt = { en: "Ex EN", sv: "Ex SV" };
  news.body = { en: "Body EN", sv: "Body SV" };
  news.status = "draft";
  const nv = validateNews(news);
  assert.equal(nv.ok, true);
  const md = newsToMarkdown(nv.data!);
  assert.match(md, /slug: /);
  assert.match(md, /body:\s*\n\s+en: \|/);

  console.log("Manager export tests passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
