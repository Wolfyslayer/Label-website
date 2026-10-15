import { loadContentFromFiles } from "@/lib/content/load-files";
import type { SiteContentSource } from "@/lib/types/content";

/**
 * Site content for static GitHub Pages builds.
 * Source of truth: `content/` (JSON + Markdown). See docs/CONTENT_MANAGEMENT.md.
 */
export const seedContent: SiteContentSource = loadContentFromFiles();
