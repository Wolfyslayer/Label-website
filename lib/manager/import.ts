import matter from "gray-matter";
import {
  validateArtist,
  validateNews,
  validateRelease,
  validateTrack,
} from "@/lib/manager/validate";
import type { ImportResult, ManagerWorkspace } from "@/lib/manager/types";

function classifyPath(name: string): ImportResult["kind"] {
  const lower = name.toLowerCase();
  if (lower.includes("/releases/") || lower.startsWith("releases/")) return "release";
  if (lower.includes("/tracks/") || lower.startsWith("tracks/")) return "track";
  if (lower.includes("/artists/") || lower.startsWith("artists/")) return "artist";
  if (lower.includes("/news/") || lower.endsWith(".md")) return "news";
  if (lower.endsWith(".json")) return "unknown";
  return "unknown";
}

function fileBaseName(name: string): string {
  return name.split("/").pop() ?? name;
}

export function parseImportFile(
  fileName: string,
  text: string,
): { kind: ImportResult["kind"]; data?: unknown; error?: string } {
  const kind = classifyPath(fileName);
  try {
    if (kind === "news" || fileName.endsWith(".md")) {
      const { data } = matter(text);
      return { kind: "news", data };
    }
    if (fileName.endsWith(".json")) {
      const data = JSON.parse(text) as unknown;
      if (kind === "release") return { kind: "release", data };
      if (kind === "track") return { kind: "track", data };
      if (kind === "artist") return { kind: "artist", data };
      if ("artistId" in (data as object) && "releaseDate" in (data as object)) {
        return { kind: "release", data };
      }
      if ("releaseId" in (data as object) && "trackNumber" in (data as object)) {
        return { kind: "track", data };
      }
      if ("longBio" in (data as object) && "theme" in (data as object)) {
        return { kind: "artist", data };
      }
      return { kind: "unknown", data };
    }
    return { kind: "unknown", error: "Unsupported file type" };
  } catch (e) {
    return { kind: "unknown", error: e instanceof Error ? e.message : String(e) };
  }
}

export function mergeImportIntoWorkspace(
  workspace: ManagerWorkspace,
  fileName: string,
  text: string,
  mode: "merge" | "skip-existing",
): { workspace: ManagerWorkspace; result: ImportResult } {
  const parsed = parseImportFile(fileName, text);
  const baseName = fileBaseName(fileName);

  if (parsed.error) {
    return {
      workspace,
      result: { kind: parsed.kind, name: baseName, added: false, message: parsed.error },
    };
  }

  if (parsed.kind === "release") {
    const v = validateRelease(parsed.data);
    if (!v.ok) {
      return {
        workspace,
        result: {
          kind: "release",
          name: baseName,
          added: false,
          message: v.issues.map((i) => i.message).join("; "),
        },
      };
    }
    const exists = workspace.releases.some((r) => r.id === v.data.id || r.slug === v.data.slug);
    if (exists && mode === "skip-existing") {
      return {
        workspace,
        result: { kind: "release", name: baseName, added: false, message: "Release already in workspace — skipped." },
      };
    }
    const releases = exists
      ? workspace.releases.map((r) => (r.slug === v.data.slug ? v.data : r))
      : [...workspace.releases, v.data];
    return {
      workspace: { ...workspace, releases },
      result: { kind: "release", name: baseName, added: true, message: "Release imported." },
    };
  }

  if (parsed.kind === "track") {
    const v = validateTrack(parsed.data);
    if (!v.ok) {
      return {
        workspace,
        result: { kind: "track", name: baseName, added: false, message: v.issues.map((i) => i.message).join("; ") },
      };
    }
    const exists = workspace.tracks.some((t) => t.id === v.data.id);
    if (exists && mode === "skip-existing") {
      return {
        workspace,
        result: { kind: "track", name: baseName, added: false, message: "Track already in workspace — skipped." },
      };
    }
    const tracks = exists
      ? workspace.tracks.map((t) => (t.id === v.data.id ? v.data : t))
      : [...workspace.tracks, v.data];
    return {
      workspace: { ...workspace, tracks },
      result: { kind: "track", name: baseName, added: true, message: "Track imported." },
    };
  }

  if (parsed.kind === "artist") {
    const v = validateArtist(parsed.data);
    if (!v.ok) {
      return {
        workspace,
        result: { kind: "artist", name: baseName, added: false, message: v.issues.map((i) => i.message).join("; ") },
      };
    }
    const exists = workspace.artists.some((a) => a.slug === v.data.slug);
    if (exists && mode === "skip-existing") {
      return {
        workspace,
        result: { kind: "artist", name: baseName, added: false, message: "Artist already in workspace — skipped." },
      };
    }
    const artists = exists
      ? workspace.artists.map((a) => (a.slug === v.data.slug ? v.data : a))
      : [...workspace.artists, v.data];
    return {
      workspace: { ...workspace, artists },
      result: { kind: "artist", name: baseName, added: true, message: "Artist imported." },
    };
  }

  if (parsed.kind === "news") {
    const v = validateNews(parsed.data);
    if (!v.ok) {
      return {
        workspace,
        result: { kind: "news", name: baseName, added: false, message: v.issues.map((i) => i.message).join("; ") },
      };
    }
    const exists = workspace.news.some((n) => n.slug === v.data.slug);
    if (exists && mode === "skip-existing") {
      return {
        workspace,
        result: { kind: "news", name: baseName, added: false, message: "News already in workspace — skipped." },
      };
    }
    const news = exists
      ? workspace.news.map((n) => (n.slug === v.data.slug ? v.data : n))
      : [...workspace.news, v.data];
    return {
      workspace: { ...workspace, news },
      result: { kind: "news", name: baseName, added: true, message: "News imported." },
    };
  }

  return {
    workspace,
    result: { kind: "unknown", name: baseName, added: false, message: "Could not classify file." },
  };
}
