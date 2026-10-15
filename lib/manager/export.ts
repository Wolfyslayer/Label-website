import JSZip from "jszip";
import { newsToMarkdown } from "@/lib/manager/news-markdown";
import { compactSocial, compactStreaming } from "@/lib/manager/streaming";
import { validateWorkspace } from "@/lib/manager/validate";
import type { ExportManifestEntry, ManagerWorkspace } from "@/lib/manager/types";

export type BuiltExport = {
  manifest: ExportManifestEntry[];
  issues: { field: string; message: string }[];
  zipBlob: Blob | null;
};

function jsonFile(path: string, data: unknown): { path: string; content: string } {
  return { path, content: `${JSON.stringify(data, null, 2)}\n` };
}

export async function buildExportZip(workspace: ManagerWorkspace): Promise<BuiltExport> {
  const issues = validateWorkspace(workspace.releases, workspace.tracks, workspace.artists, workspace.news);
  if (issues.length) {
    return { manifest: [], issues, zipBlob: null };
  }

  const zip = new JSZip();
  const manifest: ExportManifestEntry[] = [];

  for (const release of workspace.releases) {
    const artwork = workspace.artwork.find((a) => a.releaseSlug === release.slug);
    let cover = release.cover;
    if (artwork) {
      cover = { ...release.cover, src: artwork.publicPath, placeholder: false };
    }
    const payload = {
      ...release,
      cover,
      streamingLinks: compactStreaming(release.streamingLinks),
    };
    const path = `content/releases/${release.slug}.json`;
    zip.file(path, JSON.stringify(payload, null, 2));
    manifest.push({ path, description: `Release: ${release.title}` });

    if (artwork) {
      const ext = artwork.file.name.split(".").pop()?.toLowerCase() || "webp";
      const assetPath = `public${artwork.publicPath}`.replace(/\/+/g, "/");
      const buf = await artwork.file.arrayBuffer();
      zip.file(assetPath, buf);
      manifest.push({ path: assetPath, description: `Artwork for ${release.title} (.${ext})` });
    }
  }

  for (const track of workspace.tracks) {
    const path = `content/tracks/${track.slug}.json`;
    zip.file(path, JSON.stringify(track, null, 2));
    manifest.push({ path, description: `Track: ${track.title}` });
  }

  for (const artist of workspace.artists) {
    const payload = {
      ...artist,
      streamingLinks: compactStreaming(artist.streamingLinks),
      socialLinks: compactSocial(artist.socialLinks),
    };
    const path = `content/artists/${artist.slug}.json`;
    zip.file(path, JSON.stringify(payload, null, 2));
    manifest.push({ path, description: `Artist: ${artist.name}` });
  }

  for (const article of workspace.news) {
    const path = `content/news/${article.slug}.md`;
    zip.file(path, newsToMarkdown(article));
    manifest.push({ path, description: `News: ${article.title.en}` });
  }

  zip.file(
    "UPLOAD_INSTRUCTIONS.txt",
    [
      "Wolfyslayer Records — Music Manager export",
      "",
      "This ZIP does NOT publish your site automatically.",
      "",
      "1. Unzip on your computer or phone (Files app).",
      "2. In GitHub, open Wolfyslayer/Label-website.",
      "3. Upload each file to the matching path shown in the manager manifest.",
      "   - content/releases/ → repository content/releases/",
      "   - content/tracks/ → content/tracks/",
      "   - content/artists/ → content/artists/",
      "   - content/news/ → content/news/",
      "   - public/assets/... → public/assets/...",
      "4. Commit to main. GitHub Actions will validate content and deploy Pages.",
      "",
      "See docs/MUSIC_MANAGER.md for Android steps.",
      "",
    ].join("\n"),
  );
  manifest.push({ path: "UPLOAD_INSTRUCTIONS.txt", description: "Upload & deploy reminder" });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return { manifest, issues: [], zipBlob };
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
