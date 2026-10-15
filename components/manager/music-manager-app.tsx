"use client";

import { DisclaimerBanner } from "@/components/manager/disclaimer-banner";
import { ManagerField, managerInputClass, managerTextareaClass } from "@/components/manager/manager-field";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LabelMonogram } from "@/components/brand/label-monogram";
import { defaultArtistForm, MANAGER_ARTISTS, type ArtistKey } from "@/lib/manager/artists";
import {
  clearDraft,
  emptyWorkspace,
  loadDraft,
  restoreWorkspaceFromDraft,
  saveDraft,
} from "@/lib/manager/draft-storage";
import { buildExportZip, triggerDownload } from "@/lib/manager/export";
import { mergeImportIntoWorkspace } from "@/lib/manager/import";
import { createEmptyNews } from "@/lib/manager/news-factory";
import { createEmptyRelease } from "@/lib/manager/release-factory";
import { releaseAtFromDate, slugify } from "@/lib/manager/slugs";
import {
  createTrackDraft,
  parseDurationInput,
  reorderTracks,
  syncReleaseTrackIds,
} from "@/lib/manager/tracks";
import { validateArtist, validateNews, validateRelease, validateTrack } from "@/lib/manager/validate";
import type { ExportManifestEntry, ManagerWorkspace, ReleaseForm, TrackForm } from "@/lib/manager/types";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type View = "dashboard" | "release" | "tracks" | "artist" | "news" | "import" | "export";

export function MusicManagerApp() {
  const [view, setView] = useState<View>("dashboard");
  const [workspace, setWorkspace] = useState<ManagerWorkspace>(emptyWorkspace());
  const [draftLoaded, setDraftLoaded] = useState(false);

  const [releaseDraft, setReleaseDraft] = useState<ReleaseForm>(() =>
    createEmptyRelease("single", "frostmark"),
  );
  const [releaseIssues, setReleaseIssues] = useState<{ field: string; message: string }[]>([]);

  const [trackReleaseId, setTrackReleaseId] = useState<string>("");
  const [trackDrafts, setTrackDrafts] = useState<TrackForm[]>([]);

  const [artistKey, setArtistKey] = useState<ArtistKey>("frostmark");
  const [artistDraft, setArtistDraft] = useState(() => defaultArtistForm("frostmark"));
  const [artistIssues, setArtistIssues] = useState<{ field: string; message: string }[]>([]);

  const [newsDraft, setNewsDraft] = useState(createEmptyNews);
  const [newsIssues, setNewsIssues] = useState<{ field: string; message: string }[]>([]);

  const [importLog, setImportLog] = useState<string[]>([]);
  const [exportManifest, setExportManifest] = useState<ExportManifestEntry[]>([]);
  const [exportIssues, setExportIssues] = useState<{ field: string; message: string }[]>([]);
  const [artPreview, setArtPreview] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadDraft();
    if (stored) {
      setWorkspace(restoreWorkspaceFromDraft(stored));
    }
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    saveDraft(workspace);
  }, [workspace, draftLoaded]);

  const releaseOptions = useMemo(
    () => workspace.releases.map((r) => ({ id: r.id, label: `${r.title} (${r.slug})` })),
    [workspace.releases],
  );

  const loadTracksForRelease = useCallback(
    (releaseId: string) => {
      setTrackReleaseId(releaseId);
      const release = workspace.releases.find((r) => r.id === releaseId);
      if (!release) {
        setTrackDrafts([]);
        return;
      }
      const existing = workspace.tracks
        .filter((t) => t.releaseId === releaseId)
        .sort((a, b) => a.trackNumber - b.trackNumber);
      setTrackDrafts(existing);
    },
    [workspace.releases, workspace.tracks],
  );

  function startRelease(type: ReleaseForm["type"]) {
    setReleaseDraft(createEmptyRelease(type, "frostmark"));
    setReleaseIssues([]);
    setView("release");
  }

  function saveReleaseToWorkspace() {
    const withDate = { ...releaseDraft, releaseAt: releaseAtFromDate(releaseDraft.releaseDate) };
    if (!withDate.slug.trim()) withDate.slug = slugify(withDate.title) || withDate.id;
    const v = validateRelease(withDate);
    if (!v.ok) {
      setReleaseIssues(v.issues);
      return;
    }
    setWorkspace((ws) => {
      const exists = ws.releases.some((r) => r.slug === v.data.slug);
      const releases = exists
        ? ws.releases.map((r) => (r.slug === v.data.slug ? v.data : r))
        : [...ws.releases, v.data];
      return { ...ws, releases };
    });
    setReleaseIssues([]);
    setView("dashboard");
  }

  function saveTracksToWorkspace() {
    const release = workspace.releases.find((r) => r.id === trackReleaseId);
    if (!release) return;
    const validated: TrackForm[] = [];
    const issues: { field: string; message: string }[] = [];
    trackDrafts.forEach((t, i) => {
      const v = validateTrack({ ...t, releaseId: release.id, artistId: release.artistId });
      if (!v.ok) issues.push(...v.issues.map((x) => ({ field: `track ${i + 1}: ${x.field}`, message: x.message })));
      else validated.push(v.data);
    });
    if (issues.length) {
      setExportIssues(issues);
      return;
    }
    setWorkspace((ws) => {
      const others = ws.tracks.filter((t) => t.releaseId !== release.id);
      const trackIds = syncReleaseTrackIds(release.id, validated);
      const releases = ws.releases.map((r) => (r.id === release.id ? { ...r, trackIds } : r));
      return { ...ws, tracks: [...others, ...validated], releases };
    });
    setExportIssues([]);
    setView("dashboard");
  }

  function saveArtistToWorkspace() {
    const v = validateArtist(artistDraft);
    if (!v.ok) {
      setArtistIssues(v.issues);
      return;
    }
    setWorkspace((ws) => {
      const artists = ws.artists.some((a) => a.slug === v.data.slug)
        ? ws.artists.map((a) => (a.slug === v.data.slug ? v.data : a))
        : [...ws.artists, v.data];
      return { ...ws, artists };
    });
    setArtistIssues([]);
    setView("dashboard");
  }

  function saveNewsToWorkspace() {
    const v = validateNews(newsDraft);
    if (!v.ok) {
      setNewsIssues(v.issues);
      return;
    }
    setWorkspace((ws) => {
      const news = ws.news.some((n) => n.slug === v.data.slug)
        ? ws.news.map((n) => (n.slug === v.data.slug ? v.data : n))
        : [...ws.news, v.data];
      return { ...ws, news };
    });
    setNewsIssues([]);
    setView("dashboard");
  }

  async function onImportFiles(files: FileList | null) {
    if (!files?.length) return;
    let ws = workspace;
    const log: string[] = [];
    for (const file of Array.from(files)) {
      const text = await file.text();
      const { workspace: next, result } = mergeImportIntoWorkspace(ws, file.name, text, "skip-existing");
      ws = next;
      log.push(`${result.added ? "✓" : "–"} ${file.name}: ${result.message}`);
    }
    setWorkspace(ws);
    setImportLog(log);
  }

  async function runExport() {
    const result = await buildExportZip(workspace);
    setExportManifest(result.manifest);
    setExportIssues(result.issues);
    if (result.zipBlob) {
      triggerDownload(result.zipBlob, `wolfyslayer-content-${Date.now()}.zip`);
    }
  }

  function onArtworkPick(file: File | null) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
    const publicPath = `/assets/releases/${releaseDraft.slug}/cover.${ext}`;
    const previewUrl = URL.createObjectURL(file);
    setArtPreview(previewUrl);
    setReleaseDraft((r) => ({
      ...r,
      cover: { ...r.cover, src: publicPath, placeholder: false },
    }));
    setWorkspace((ws) => ({
      ...ws,
      artwork: [
        ...ws.artwork.filter((a) => a.releaseSlug !== releaseDraft.slug),
        { releaseSlug: releaseDraft.slug, file, previewUrl, publicPath },
      ],
    }));
  }

  function clearLocalData() {
    if (!window.confirm("Clear autosaved drafts on this device? Export first if needed.")) return;
    clearDraft();
    setWorkspace(emptyWorkspace());
    setImportLog([]);
    setExportManifest([]);
  }

  return (
    <div className="min-h-dvh bg-void pb-[max(2rem,env(safe-area-inset-bottom))]">
      <DisclaimerBanner />
      <header className="border-b border-border-subtle bg-charcoal/40">
        <Container className="flex min-h-[var(--header-height)] items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <LabelMonogram className="h-9 w-9 shrink-0 text-silver" />
            <div className="min-w-0">
              <p className="font-display text-xs tracking-[0.2em] text-text-primary">Music Manager</p>
              <p className="truncate text-[10px] uppercase tracking-widest text-text-muted">Wolfyslayer Records</p>
            </div>
          </div>
          <Link
            href="/en/"
            className="shrink-0 text-xs uppercase tracking-wider text-silver hover:text-text-primary"
          >
            View site
          </Link>
        </Container>
      </header>

      <Container className="py-6">
        <nav className="mb-8 flex gap-2 overflow-x-auto pb-1" aria-label="Manager sections">
          {(
            [
              ["dashboard", "Dashboard"],
              ["release", "Release"],
              ["tracks", "Tracks"],
              ["artist", "Artist"],
              ["news", "News"],
              ["import", "Import"],
              ["export", "Export"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={cn(
                "min-h-11 shrink-0 rounded-sm border px-4 text-xs uppercase tracking-wider transition-colors",
                view === id
                  ? "border-silver bg-surface-elevated text-text-primary"
                  : "border-border text-text-muted hover:text-text-primary",
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        {view === "dashboard" ? (
          <section className="space-y-6">
            <h1 className="type-h3 font-display text-text-primary">Dashboard</h1>
            <p className="text-sm text-text-secondary">
              Create releases and news, then export a ZIP for manual upload to GitHub. Nothing is published until
              you commit to the repository.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" className="min-h-12 w-full" onClick={() => startRelease("single")}>
                New single
              </Button>
              <Button type="button" className="min-h-12 w-full" onClick={() => startRelease("ep")}>
                New EP
              </Button>
              <Button type="button" className="min-h-12 w-full" onClick={() => startRelease("album")}>
                New album
              </Button>
              <Button type="button" variant="outline" className="min-h-12 w-full" onClick={() => setView("tracks")}>
                Edit tracks
              </Button>
              <Button type="button" variant="outline" className="min-h-12 w-full" onClick={() => setView("news")}>
                New news article
              </Button>
              <Button type="button" variant="outline" className="min-h-12 w-full" onClick={() => setView("artist")}>
                Edit artist
              </Button>
              <Button type="button" variant="secondary" className="min-h-12 w-full" onClick={() => setView("import")}>
                Import files
              </Button>
              <Button type="button" variant="secondary" className="min-h-12 w-full" onClick={() => setView("export")}>
                Export ZIP
              </Button>
            </div>
            <div className="surface-panel grid gap-2 p-4 text-sm sm:grid-cols-4">
              <p>Releases: {workspace.releases.length}</p>
              <p>Tracks: {workspace.tracks.length}</p>
              <p>Artists: {workspace.artists.length}</p>
              <p>News: {workspace.news.length}</p>
            </div>
            <Button type="button" variant="ghost" className="min-h-11" onClick={clearLocalData}>
              Clear local autosave on this device
            </Button>
          </section>
        ) : null}

        {view === "release" ? (
          <section className="mx-auto max-w-xl space-y-6">
            <h1 className="type-h3 font-display">Release editor</h1>
            <ManagerField label="Artist">
              <select
                className={managerInputClass}
                value={artistKeyFromRelease(releaseDraft.artistId) ?? "frostmark"}
                onChange={(e) => {
                  const key = e.target.value as ArtistKey;
                  const meta = MANAGER_ARTISTS[key];
                  setReleaseDraft((r) => ({ ...r, artistId: meta.id }));
                }}
              >
                <option value="frostmark">Frostmark</option>
                <option value="wolfyslayer">Wolfyslayer</option>
              </select>
            </ManagerField>
            <ManagerField label="Title" htmlFor="release-title">
              <input
                id="release-title"
                className={managerInputClass}
                value={releaseDraft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setReleaseDraft((r) => ({
                    ...r,
                    title,
                    slug: slugify(title) || r.slug,
                  }));
                }}
              />
            </ManagerField>
            <ManagerField label="Slug" hint="Lowercase, hyphens only. Used in URLs and filenames.">
              <input
                className={managerInputClass}
                value={releaseDraft.slug}
                onChange={(e) => setReleaseDraft((r) => ({ ...r, slug: slugify(e.target.value) }))}
              />
            </ManagerField>
            <ManagerField label="Type">
              <select
                className={managerInputClass}
                value={releaseDraft.type}
                onChange={(e) =>
                  setReleaseDraft((r) => ({ ...r, type: e.target.value as ReleaseForm["type"] }))
                }
              >
                <option value="single">Single</option>
                <option value="ep">EP</option>
                <option value="album">Album</option>
              </select>
            </ManagerField>
            <ManagerField label="Release date">
              <input
                type="date"
                className={managerInputClass}
                value={releaseDraft.releaseDate}
                onChange={(e) => setReleaseDraft((r) => ({ ...r, releaseDate: e.target.value }))}
              />
            </ManagerField>
            <ManagerField label="Status">
              <select
                className={managerInputClass}
                value={releaseDraft.status}
                onChange={(e) =>
                  setReleaseDraft((r) => ({ ...r, status: e.target.value as ReleaseForm["status"] }))
                }
              >
                <option value="draft">Draft (hidden on site)</option>
                <option value="published">Published</option>
              </select>
            </ManagerField>
            <ManagerField label="Description (English)">
              <textarea
                className={managerTextareaClass}
                value={releaseDraft.description.en}
                onChange={(e) =>
                  setReleaseDraft((r) => ({ ...r, description: { ...r.description, en: e.target.value } }))
                }
              />
            </ManagerField>
            <ManagerField label="Description (Swedish)">
              <textarea
                className={managerTextareaClass}
                value={releaseDraft.description.sv}
                onChange={(e) =>
                  setReleaseDraft((r) => ({ ...r, description: { ...r.description, sv: e.target.value } }))
                }
              />
            </ManagerField>
            <ManagerField label="Artwork" hint="Included in ZIP under public/assets/releases/…">
              <input
                type="file"
                accept="image/*"
                className="min-h-11 w-full text-sm text-text-secondary"
                onChange={(e) => onArtworkPick(e.target.files?.[0] ?? null)}
              />
              {artPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={artPreview} alt="" className="mt-2 max-h-48 rounded-sm ring-1 ring-border-subtle" />
              ) : null}
              <p className="text-xs text-text-muted">Path: {releaseDraft.cover.src}</p>
            </ManagerField>
            <ManagerField label="Spotify URL">
              <input
                className={managerInputClass}
                value={releaseDraft.streamingLinks.spotify ?? ""}
                onChange={(e) =>
                  setReleaseDraft((r) => ({
                    ...r,
                    streamingLinks: { ...r.streamingLinks, spotify: e.target.value },
                  }))
                }
                placeholder="https://open.spotify.com/album/…"
              />
            </ManagerField>
            <ManagerField label="Apple Music URL">
              <input
                className={managerInputClass}
                value={releaseDraft.streamingLinks.appleMusic ?? ""}
                onChange={(e) =>
                  setReleaseDraft((r) => ({
                    ...r,
                    streamingLinks: { ...r.streamingLinks, appleMusic: e.target.value },
                  }))
                }
              />
            </ManagerField>
            <ManagerField label="YouTube Music URL">
              <input
                className={managerInputClass}
                value={releaseDraft.streamingLinks.youtubeMusic ?? ""}
                onChange={(e) =>
                  setReleaseDraft((r) => ({
                    ...r,
                    streamingLinks: { ...r.streamingLinks, youtubeMusic: e.target.value },
                  }))
                }
              />
            </ManagerField>
            {releaseIssues.map((i) => (
              <p key={`${i.field}-${i.message}`} className="text-sm text-danger">
                {i.field}: {i.message}
              </p>
            ))}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" className="min-h-12 flex-1" onClick={saveReleaseToWorkspace}>
                Save to workspace
              </Button>
              <Button type="button" variant="outline" className="min-h-12 flex-1" onClick={() => setView("dashboard")}>
                Cancel
              </Button>
            </div>
          </section>
        ) : null}

        {view === "tracks" ? (
          <section className="mx-auto max-w-xl space-y-6">
            <h1 className="type-h3 font-display">Track editor</h1>
            <ManagerField label="Release">
              <select
                className={managerInputClass}
                value={trackReleaseId}
                onChange={(e) => loadTracksForRelease(e.target.value)}
              >
                <option value="">Select release…</option>
                {releaseOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </ManagerField>
            {trackReleaseId ? (
              <>
                <ul className="space-y-3">
                  {trackDrafts.map((track, index) => (
                    <li key={track.id} className="surface-panel space-y-2 p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="min-h-11 min-w-11 rounded-sm border border-border text-xs"
                          aria-label="Move track up"
                          onClick={() => setTrackDrafts((list) => reorderTracks(list, index, -1))}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="min-h-11 min-w-11 rounded-sm border border-border text-xs"
                          aria-label="Move track down"
                          onClick={() => setTrackDrafts((list) => reorderTracks(list, index, 1))}
                        >
                          ↓
                        </button>
                        <span className="flex min-h-11 items-center text-xs text-text-muted">#{track.trackNumber}</span>
                      </div>
                      <input
                        className={managerInputClass}
                        value={track.title}
                        onChange={(e) =>
                          setTrackDrafts((list) =>
                            list.map((t, i) => (i === index ? { ...t, title: e.target.value } : t)),
                          )
                        }
                        aria-label={`Track ${index + 1} title`}
                      />
                      <input
                        className={managerInputClass}
                        placeholder="Duration mm:ss or seconds"
                        onChange={(e) => {
                          const durationSeconds = parseDurationInput(e.target.value);
                          setTrackDrafts((list) =>
                            list.map((t, i) => (i === index ? { ...t, durationSeconds } : t)),
                          );
                        }}
                        aria-label={`Track ${index + 1} duration`}
                      />
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full"
                  onClick={() => {
                    const release = workspace.releases.find((r) => r.id === trackReleaseId);
                    if (!release) return;
                    setTrackDrafts((list) => [
                      ...list,
                      createTrackDraft(release.id, release.slug, release.artistId, "", list.length),
                    ]);
                  }}
                >
                  Add track
                </Button>
                {exportIssues.map((i) => (
                  <p key={i.message} className="text-sm text-danger">
                    {i.field}: {i.message}
                  </p>
                ))}
                <Button type="button" className="min-h-12 w-full" onClick={saveTracksToWorkspace}>
                  Save tracks to workspace
                </Button>
              </>
            ) : (
              <p className="text-sm text-text-muted">Save a release first, then select it here.</p>
            )}
          </section>
        ) : null}

        {view === "artist" ? (
          <section className="mx-auto max-w-xl space-y-6">
            <h1 className="type-h3 font-display">Artist editor</h1>
            <ManagerField label="Artist">
              <select
                className={managerInputClass}
                value={artistKey}
                onChange={(e) => {
                  const key = e.target.value as ArtistKey;
                  setArtistKey(key);
                  const existing = workspace.artists.find((a) => a.slug === MANAGER_ARTISTS[key].slug);
                  setArtistDraft(existing ?? defaultArtistForm(key));
                }}
              >
                <option value="frostmark">Frostmark</option>
                <option value="wolfyslayer">Wolfyslayer</option>
              </select>
            </ManagerField>
            {(["longBio", "shortBio"] as const).map((field) => (
              <div key={field} className="space-y-3">
                <ManagerField label={`${field === "longBio" ? "Biography" : "Short bio"} (English)`}>
                  <textarea
                    className={managerTextareaClass}
                    value={artistDraft[field].en}
                    onChange={(e) =>
                      setArtistDraft((a) => ({ ...a, [field]: { ...a[field], en: e.target.value } }))
                    }
                  />
                </ManagerField>
                <ManagerField label={`${field === "longBio" ? "Biography" : "Short bio"} (Swedish)`}>
                  <textarea
                    className={managerTextareaClass}
                    value={artistDraft[field].sv}
                    onChange={(e) =>
                      setArtistDraft((a) => ({ ...a, [field]: { ...a[field], sv: e.target.value } }))
                    }
                  />
                </ManagerField>
              </div>
            ))}
            <ManagerField label="Profile image path">
              <input
                className={managerInputClass}
                value={artistDraft.image.src}
                onChange={(e) =>
                  setArtistDraft((a) => ({ ...a, image: { ...a.image, src: e.target.value } }))
                }
              />
            </ManagerField>
            <ManagerField label="Spotify artist URL">
              <input
                className={managerInputClass}
                value={artistDraft.spotifyArtistUrl}
                onChange={(e) => setArtistDraft((a) => ({ ...a, spotifyArtistUrl: e.target.value }))}
              />
            </ManagerField>
            {artistIssues.map((i) => (
              <p key={i.message} className="text-sm text-danger">
                {i.field}: {i.message}
              </p>
            ))}
            <Button type="button" className="min-h-12 w-full" onClick={saveArtistToWorkspace}>
              Save artist to workspace
            </Button>
          </section>
        ) : null}

        {view === "news" ? (
          <section className="mx-auto max-w-xl space-y-6">
            <h1 className="type-h3 font-display">News editor</h1>
            <ManagerField label="Slug">
              <input
                className={managerInputClass}
                value={newsDraft.slug}
                onChange={(e) => setNewsDraft((n) => ({ ...n, slug: slugify(e.target.value) }))}
              />
            </ManagerField>
            <ManagerField label="Status">
              <select
                className={managerInputClass}
                value={newsDraft.status}
                onChange={(e) =>
                  setNewsDraft((n) => ({ ...n, status: e.target.value as typeof newsDraft.status }))
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </ManagerField>
            <ManagerField label="Published at (ISO UTC)">
              <input
                className={managerInputClass}
                value={newsDraft.publishedAt}
                onChange={(e) => setNewsDraft((n) => ({ ...n, publishedAt: e.target.value }))}
              />
            </ManagerField>
            {(["title", "excerpt", "body"] as const).map((field) => (
              <div key={field} className="space-y-3">
                <ManagerField label={`${field} (English)`}>
                  <textarea
                    className={managerTextareaClass}
                    value={newsDraft[field].en}
                    onChange={(e) =>
                      setNewsDraft((n) => ({ ...n, [field]: { ...n[field], en: e.target.value } }))
                    }
                  />
                </ManagerField>
                <ManagerField label={`${field} (Swedish)`}>
                  <textarea
                    className={managerTextareaClass}
                    value={newsDraft[field].sv}
                    onChange={(e) =>
                      setNewsDraft((n) => ({ ...n, [field]: { ...n[field], sv: e.target.value } }))
                    }
                  />
                </ManagerField>
              </div>
            ))}
            <ManagerField label="Related artist">
              <select
                className={managerInputClass}
                value={newsDraft.artistId ?? ""}
                onChange={(e) =>
                  setNewsDraft((n) => ({ ...n, artistId: e.target.value || undefined }))
                }
              >
                <option value="">None</option>
                <option value={MANAGER_ARTISTS.frostmark.id}>Frostmark</option>
                <option value={MANAGER_ARTISTS.wolfyslayer.id}>Wolfyslayer</option>
              </select>
            </ManagerField>
            <ManagerField label="Cover image path">
              <input
                className={managerInputClass}
                value={newsDraft.cover.src}
                onChange={(e) =>
                  setNewsDraft((n) => ({ ...n, cover: { ...n.cover, src: e.target.value } }))
                }
              />
            </ManagerField>
            {newsIssues.map((i) => (
              <p key={i.message} className="text-sm text-danger">
                {i.field}: {i.message}
              </p>
            ))}
            <Button type="button" className="min-h-12 w-full" onClick={saveNewsToWorkspace}>
              Save news to workspace
            </Button>
          </section>
        ) : null}

        {view === "import" ? (
          <section className="mx-auto max-w-xl space-y-4">
            <h1 className="type-h3 font-display">Import</h1>
            <p className="text-sm text-text-secondary">
              Select JSON or Markdown from your device. Existing items with the same slug/id are skipped unless
              you confirm overwrite in a future version — currently imports skip duplicates.
            </p>
            <input
              type="file"
              multiple
              accept=".json,.md,application/json,text/markdown"
              className="min-h-11 w-full text-sm"
              onChange={(e) => onImportFiles(e.target.files)}
            />
            <ul className="space-y-1 text-sm text-text-muted">
              {importLog.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {view === "export" ? (
          <section className="mx-auto max-w-xl space-y-4">
            <h1 className="type-h3 font-display">Export</h1>
            <p className="text-sm text-text-secondary">
              Validates content, then downloads a ZIP. Upload files to GitHub manually — exporting does not publish
              the website.
            </p>
            <Button type="button" className="min-h-12 w-full" onClick={runExport}>
              Download ZIP
            </Button>
            {exportIssues.length ? (
              <ul className="space-y-1 text-sm text-danger">
                {exportIssues.map((i) => (
                  <li key={`${i.field}-${i.message}`}>
                    {i.field}: {i.message}
                  </li>
                ))}
              </ul>
            ) : null}
            {exportManifest.length ? (
              <ul className="surface-panel space-y-2 p-4 text-sm">
                {exportManifest.map((m) => (
                  <li key={m.path}>
                    <code className="text-silver">{m.path}</code>
                    <span className="text-text-muted"> — {m.description}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </Container>
    </div>
  );
}

function artistKeyFromRelease(artistId: string): ArtistKey | null {
  if (artistId === MANAGER_ARTISTS.frostmark.id) return "frostmark";
  if (artistId === MANAGER_ARTISTS.wolfyslayer.id) return "wolfyslayer";
  return null;
}
