#!/usr/bin/env tsx
import { fetchClientCredentialsToken, requireSpotifyCredentials } from "@/lib/spotify/auth";
import { importSpotifyCatalog } from "@/lib/spotify/import-catalog";
import { applyImportWrites } from "@/lib/spotify/write-content";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const args = process.argv.slice(2).filter((a) => a !== "--dry-run");

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`Usage: npm run import:spotify [-- --dry-run]

Fetches Frostmark and Wolfyslayer catalogs from Spotify (Client Credentials).
Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the environment.
Never writes credentials to content files.

  --dry-run   Print planned file changes without modifying content/
`);
    process.exit(0);
  }

  const { clientId, clientSecret } = requireSpotifyCredentials();
  const token = await fetchClientCredentialsToken(fetch, clientId, clientSecret);

  console.log("Spotify authentication succeeded (client credentials).");
  console.log("Importing catalogs for Frostmark and Wolfyslayer…\n");

  const result = await importSpotifyCatalog(token);
  console.log(result.reportLines.join("\n"));

  const writeResult = applyImportWrites(result, { dryRun });
  if (dryRun) {
    console.log("\n[dry-run] Would write:");
    for (const f of writeResult.filesWritten) console.log(`  + ${f}`);
    console.log("\n[dry-run] Would remove:");
    for (const f of writeResult.filesRemoved) console.log(`  - ${f}`);
    process.exit(0);
  }

  console.log(`\nWrote ${writeResult.filesWritten.length} file(s), removed ${writeResult.filesRemoved.length}.`);
  if (writeResult.siteUpdated) {
    console.log(`Featured release id: ${result.featuredReleaseId ?? "(none)"}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
