import { collectLaunchWarnings } from "../lib/content/launch-warnings";
import { validateContentOrThrow } from "../lib/content/validate-content";

const source = validateContentOrThrow();
console.log(
  `Content validation passed: ${source.artists.length} artists, ${source.releases.length} releases, ${source.tracks.length} tracks, ${source.news.length} news (${source.news.filter((n) => n.status === "published").length} published).`,
);

const warnings = collectLaunchWarnings(source);
if (warnings.length) {
  console.warn(`Launch readiness: ${warnings.length} owner-action item(s):`);
  for (const w of warnings) {
    console.warn(`  [${w.code}] ${w.path} — ${w.message}`);
  }
}
