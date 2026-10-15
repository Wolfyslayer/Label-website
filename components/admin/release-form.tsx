"use client";

import { DeleteEntityForm } from "@/components/admin/delete-entity-form";
import { FormStatus } from "@/components/admin/form-status";
import { LocalizedFieldGroup } from "@/components/admin/localized-field-group";
import { MediaUploadField } from "@/components/admin/media-upload-field";
import { TrackInlineForm } from "@/components/admin/track-inline-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteRelease, upsertRelease } from "@/lib/admin/actions";
import type { LocalizedFormValue } from "@/lib/admin/types";
import { useState } from "react";

export type ReleaseFormData = {
  id?: string;
  slug?: string;
  title?: string;
  artist_id?: string;
  type?: string;
  release_date?: string;
  release_at?: string;
  description: LocalizedFormValue;
  credits: LocalizedFormValue;
  status?: string;
  spotify_album_url?: string;
  pre_save_url?: string;
  featured?: boolean;
  cover: { src: string; alt: LocalizedFormValue; placeholder: boolean };
  streaming_links: Record<string, string>;
  track_ids: string[];
};

type TrackRow = {
  id: string;
  slug: string;
  title: string;
  track_number: number;
  duration_seconds?: number | null;
  spotify_track_url?: string | null;
};

export function ReleaseForm({
  release,
  artists,
  tracks,
}: {
  release?: ReleaseFormData;
  artists: { id: string; name: string }[];
  tracks?: TrackRow[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const releaseId = release?.id ?? "";

  async function action(formData: FormData) {
    setError(null);
    setSuccess(null);
    formData.set(
      "track_ids",
      (tracks ?? []).map((t) => t.id).join(","),
    );
    const result = await upsertRelease(formData);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(result.message);
  }

  return (
    <div className="space-y-10">
      <form action={action} className="space-y-6">
        {release?.id ? <input type="hidden" name="id" value={release.id} /> : null}
        {release?.slug ? (
        <p className="rounded-sm border border-border-subtle bg-surface/40 px-4 py-3 text-xs text-text-muted">
          Smart link (share): <code className="text-text-secondary">/en/releases/{release.slug}</code> ·{" "}
          <code className="text-text-secondary">/sv/releases/{release.slug}</code>
        </p>
      ) : null}
      <Input label="Title (official)" name="title" defaultValue={release?.title} required />
        <Input label="Slug" name="slug" defaultValue={release?.slug} required />
        <div className="space-y-2">
          <label htmlFor="artist_id" className="block text-sm text-text-secondary">
            Artist
          </label>
          <select
            id="artist_id"
            name="artist_id"
            defaultValue={release?.artist_id ?? artists[0]?.id}
            className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
          >
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">Type</label>
            <select
              name="type"
              defaultValue={release?.type ?? "single"}
              className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
            >
              <option value="single">Single</option>
              <option value="ep">EP</option>
              <option value="album">Album</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">Status</label>
            <select
              name="status"
              defaultValue={release?.status ?? "draft"}
              className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <Input
          label="Release date (YYYY-MM-DD)"
          name="release_date"
          defaultValue={release?.release_date}
          required
        />
        <Input
          label="Release at (ISO UTC — used for upcoming countdown)"
          name="release_at"
          defaultValue={release?.release_at ?? new Date().toISOString()}
          required
        />

        <LocalizedFieldGroup label="Description" name="description" value={release?.description ?? { en: "", sv: "" }} multiline />
        <LocalizedFieldGroup label="Credits (optional)" name="credits" value={release?.credits ?? { en: "", sv: "" }} multiline />

        <MediaUploadField
          label="Cover artwork"
          folder={`releases/${releaseId || "new"}`}
          urlFieldName="cover_src"
          defaultUrl={release?.cover.src}
        />
        <LocalizedFieldGroup label="Cover alt" name="cover_alt" value={release?.cover.alt ?? { en: "", sv: "" }} />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="cover_placeholder" defaultChecked={release?.cover.placeholder ?? true} />
          Mark cover as placeholder
        </label>

        <fieldset className="space-y-3 rounded-sm border border-border-subtle p-4">
          <legend className="px-1 text-sm font-medium">Streaming links</legend>
          {(
            [
              "spotify",
              "appleMusic",
              "youtubeMusic",
              "bandcamp",
              "soundcloud",
              "deezer",
              "tidal",
            ] as const
          ).map((key) => (
            <Input
              key={key}
              label={key}
              name={`stream_${key}`}
              defaultValue={release?.streaming_links[key] ?? ""}
            />
          ))}
        </fieldset>

        <Input label="Spotify album URL (embed)" name="spotify_album_url" defaultValue={release?.spotify_album_url ?? ""} />
        <Input label="Pre-save URL" name="pre_save_url" defaultValue={release?.pre_save_url ?? ""} />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={release?.featured} />
          Featured on homepage
        </label>

        <FormStatus error={error} success={success} />
        <Button type="submit" className="min-h-12 w-full sm:w-auto">
          Save release
        </Button>

        {release?.id && release.slug ? (
          <DeleteEntityForm
            entityLabel="release"
            id={release.id}
            slug={release.slug}
            deleteAction={deleteRelease}
          />
        ) : null}
      </form>

      {release?.id ? (
        <section className="border-t border-border-subtle pt-10">
          <h2 className="font-display text-xl">Tracks</h2>
          <p className="mt-2 text-sm text-text-muted">Save the release first, then add tracks below.</p>
          <ul className="mt-6 space-y-6">
            {(tracks ?? []).map((track) => (
              <li key={track.id} className="rounded-sm border border-border-subtle p-4">
                <TrackInlineForm
                  track={track}
                  artistId={release.artist_id ?? ""}
                  releaseId={release.id!}
                />
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-sm border border-dashed border-border p-4">
            <h3 className="text-sm font-medium">Add track</h3>
            <TrackInlineForm
              artistId={release.artist_id ?? artists[0]?.id ?? ""}
              releaseId={release.id}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
