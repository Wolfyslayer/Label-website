import type { ManagerWorkspace } from "@/lib/manager/types";

const STORAGE_KEY = "wr-music-manager-draft-v1";

export type StoredDraft = {
  savedAt: string;
  workspace: Omit<ManagerWorkspace, "artwork"> & {
    artworkMeta: { releaseSlug: string; publicPath: string; fileName: string }[];
  };
};

export function emptyWorkspace(): ManagerWorkspace {
  return { releases: [], tracks: [], artists: [], news: [], artwork: [] };
}

export function loadDraft(): StoredDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDraft;
  } catch {
    return null;
  }
}

export function saveDraft(workspace: ManagerWorkspace) {
  if (typeof window === "undefined") return;
  const payload: StoredDraft = {
    savedAt: new Date().toISOString(),
    workspace: {
      releases: workspace.releases,
      tracks: workspace.tracks,
      artists: workspace.artists,
      news: workspace.news,
      artworkMeta: workspace.artwork.map((a) => ({
        releaseSlug: a.releaseSlug,
        publicPath: a.publicPath,
        fileName: a.file.name,
      })),
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Restore workspace without binary artwork (user re-selects images after reload). */
export function restoreWorkspaceFromDraft(stored: StoredDraft): ManagerWorkspace {
  return {
    releases: stored.workspace.releases,
    tracks: stored.workspace.tracks,
    artists: stored.workspace.artists,
    news: stored.workspace.news,
    artwork: [],
  };
}
