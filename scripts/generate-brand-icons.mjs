#!/usr/bin/env node
/** @deprecated Use official files in public/assets/favicons — syncs copies to public/ root. */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const r = spawnSync(process.execPath, [join(root, "scripts/sync-public-icons.mjs")], {
  stdio: "inherit",
});
process.exit(r.status ?? 1);
