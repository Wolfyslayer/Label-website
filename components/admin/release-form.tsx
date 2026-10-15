"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertRelease } from "@/lib/admin/actions";
import { useState } from "react";

type ReleaseRow = {
  id?: string;
  slug?: string;
  title?: string;
  artist_id?: string;
  type?: string;
  release_date?: string;
  release_at?: string;
  description?: string;
  spotify_album_url?: string;
  pre_save_url?: string;
  featured?: boolean;
  status?: string;
  cover?: { src: string; alt: string; placeholder: boolean };
  streaming_links?: Record<string, string>;
};

export function ReleaseForm({
  release,
  artists,
}: {
  release?: ReleaseRow;
  artists: { id: string; name: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const cover = release?.cover ?? {
    src: "/placeholders/cover-frost.svg",
    alt: "Cover",
    placeholder: true,
  };

  async function action(formData: FormData) {
    setError(null);
    formData.set("cover", JSON.stringify({
      src: formData.get("cover_src"),
      alt: formData.get("cover_alt"),
      placeholder: formData.get("cover_placeholder") === "on",
    }));
    formData.set("streaming_links", JSON.stringify({
      spotify: formData.get("spotify") || undefined,
      appleMusic: formData.get("apple_music") || undefined,
      youtubeMusic: formData.get("youtube_music") || undefined,
    }));
    try {
      await upsertRelease(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <form action={action} className="space-y-4">
      {release?.id ? <input type="hidden" name="id" value={release.id} /> : null}
      <Input label="Title" name="title" defaultValue={release?.title} required />
      <Input label="Slug" name="slug" defaultValue={release?.slug} required />
      <div className="space-y-2">
        <label htmlFor="artist_id" className="block text-sm text-text-secondary">
          Artist
        </label>
        <select
          id="artist_id"
          name="artist_id"
          defaultValue={release?.artist_id ?? artists[0]?.id}
          className="w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
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
            className="w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
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
            className="w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>
      <Input label="Release date (YYYY-MM-DD)" name="release_date" defaultValue={release?.release_date} required />
      <Input
        label="Release at (ISO UTC)"
        name="release_at"
        defaultValue={release?.release_at ?? new Date().toISOString()}
        required
      />
      <Textarea label="Description" name="description" defaultValue={release?.description} />
      <Input label="Cover image URL" name="cover_src" defaultValue={cover.src} />
      <Input label="Cover alt text" name="cover_alt" defaultValue={cover.alt} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="cover_placeholder" defaultChecked={cover.placeholder} />
        Mark cover as placeholder
      </label>
      <Input label="Spotify album URL" name="spotify" defaultValue={release?.streaming_links?.spotify} />
      <Input label="Apple Music URL" name="apple_music" defaultValue={release?.streaming_links?.appleMusic} />
      <Input label="YouTube Music URL" name="youtube_music" defaultValue={release?.streaming_links?.youtubeMusic} />
      <Input label="Spotify album URL (embed)" name="spotify_album_url" defaultValue={release?.spotify_album_url} />
      <Input label="Pre-save URL" name="pre_save_url" defaultValue={release?.pre_save_url} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={release?.featured} />
        Featured on homepage
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit">Save release</Button>
    </form>
  );
}
