import { validateContentOrThrow } from "../lib/content/validate-content";

const source = validateContentOrThrow();
console.log(
  `Content validation passed: ${source.artists.length} artists, ${source.releases.length} releases, ${source.tracks.length} tracks, ${source.news.length} news (${source.news.filter((n) => n.status === "published").length} published).`,
);
