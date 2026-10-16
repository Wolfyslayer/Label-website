#!/usr/bin/env node
// Read-only production cache audit. No deployment credentials required.
const origin = process.env.CACHE_AUDIT_ORIGIN || "https://wolfyslayer.online";
const paths = [
  "/sv/",
  "/assets/banners/label-hero-768.webp",
  "/assets/banners/frostmark-hero-768.webp",
  "/assets/logos/wolfyslayer-records-symbol.svg",
];
const results = [];
for (const path of paths) {
  const url = new URL(path, origin).href;
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(12000) });
    const h = response.headers;
    results.push({
      path,
      status: response.status,
      cacheControl: h.get("cache-control"),
      age: h.get("age"),
      etag: h.get("etag"),
      lastModified: h.get("last-modified"),
      contentType: h.get("content-type"),
      server: h.get("server"),
      via: h.get("via"),
    });
  } catch (error) {
    results.push({ path, error: String(error) });
  }
}
console.log(JSON.stringify({ origin, checkedAt: new Date().toISOString(), results }, null, 2));
if (results.some((item) => item.error || item.status >= 400)) process.exitCode = 1;
