#!/usr/bin/env node
/** Validates SEO artifacts in `out/` after a production static build. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://wolfyslayer.online").replace(/\/$/, "");

function fail(msg) {
  console.error(`SEO validation failed: ${msg}`);
  process.exit(1);
}

if (!existsSync(out)) fail("Missing out/ — run npm run build:pages first");

const sitemapPath = join(out, "sitemap.xml");
const robotsPath = join(out, "robots.txt");
if (!existsSync(sitemapPath)) fail("Missing out/sitemap.xml");
if (!existsSync(robotsPath)) fail("Missing out/robots.txt");

const sitemap = readFileSync(sitemapPath, "utf8");
if (!sitemap.includes(siteUrl)) fail(`sitemap.xml does not include ${siteUrl}`);
if (!sitemap.includes(`${siteUrl}/en/`) || !sitemap.includes(`${siteUrl}/sv/`)) {
  fail("sitemap.xml missing en/sv locale URLs");
}
if (!sitemap.includes('hreflang="sv"') && !sitemap.includes("<xhtml:link")) {
  // Next may emit xhtml:link for alternates
  if (!sitemap.includes("alternates") && !sitemap.includes("xhtml")) {
    // relaxed: check for both locale paths on same slug
    if (!sitemap.includes("/en/artists/") || !sitemap.includes("/sv/artists/")) {
      fail("sitemap.xml missing bilingual artist routes");
    }
  }
}

const robots = readFileSync(robotsPath, "utf8");
if (!robots.includes("Sitemap:")) fail("robots.txt missing Sitemap directive");
if (!robots.includes(`${siteUrl}/sitemap.xml`)) fail(`robots.txt sitemap URL must be ${siteUrl}/sitemap.xml`);
if (!robots.includes("Disallow: /admin")) fail("robots.txt should disallow /admin");

const sampleHtml = join(out, "en/index.html");
if (!existsSync(sampleHtml)) fail("Missing out/en/index.html");
const html = readFileSync(sampleHtml, "utf8");
if (!html.includes('rel="canonical"') && !html.includes("canonical")) {
  fail("Home HTML missing canonical link");
}
if (!html.includes("og:title") && !html.includes('property="og:title"')) {
  fail("Home HTML missing Open Graph title");
}
if (!html.includes("twitter:card") && !html.includes('name="twitter:card"')) {
  fail("Home HTML missing Twitter card meta");
}

if (!existsSync(join(out, "og-default.png"))) fail("Missing out/og-default.png");
if (!existsSync(join(out, "assets/brand/wr-rune-monogram.svg"))) {
  fail("Missing out/assets/brand/wr-rune-monogram.svg");
}
if (!existsSync(join(out, "CNAME"))) fail("Missing out/CNAME");

console.log("SEO export validation passed.");
console.log(`  sitemap: ${siteUrl}/sitemap.xml`);
console.log(`  robots:  ${siteUrl}/robots.txt`);
