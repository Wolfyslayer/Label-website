import type { NewsForm } from "@/lib/manager/types";

/** Serialize news frontmatter to Markdown matching Phase 12 loader. */
export function newsToMarkdown(article: NewsForm): string {
  const lines: string[] = ["---"];
  lines.push(`id: ${article.id}`);
  lines.push(`slug: ${article.slug}`);
  lines.push(`status: ${article.status}`);
  lines.push(`publishedAt: ${article.publishedAt}`);
  if (article.artistId) lines.push(`artistId: ${article.artistId}`);
  if (article.releaseId) lines.push(`releaseId: ${article.releaseId}`);

  lines.push("title:");
  lines.push(`  en: ${yamlString(article.title.en)}`);
  lines.push(`  sv: ${yamlString(article.title.sv)}`);
  lines.push("excerpt:");
  lines.push(`  en: ${yamlString(article.excerpt.en)}`);
  lines.push(`  sv: ${yamlString(article.excerpt.sv)}`);
  lines.push("body:");
  lines.push("  en: |");
  for (const line of article.body.en.split("\n")) lines.push(`    ${line}`);
  lines.push("  sv: |");
  for (const line of article.body.sv.split("\n")) lines.push(`    ${line}`);
  lines.push("cover:");
  lines.push(`  src: ${article.cover.src}`);
  lines.push("  alt:");
  lines.push(`    en: ${yamlString(article.cover.alt.en)}`);
  lines.push(`    sv: ${yamlString(article.cover.alt.sv)}`);
  lines.push(`  placeholder: ${article.cover.placeholder}`);
  lines.push("---");
  lines.push("");
  lines.push("<!-- Body lives in YAML frontmatter for easy editing in GitHub mobile. -->");
  lines.push("");
  return lines.join("\n");
}

function yamlString(value: string): string {
  if (/[:#\n]|^\s/.test(value) || value.includes('"')) {
    return JSON.stringify(value);
  }
  return value;
}
