"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertArtist } from "@/lib/admin/actions";
import { useState } from "react";

export function ArtistAdminForm({ artist }: { artist: Record<string, unknown> }) {
  const [error, setError] = useState<string | null>(null);
  const image = (artist.image as { src: string; alt: string; placeholder: boolean }) ?? {
    src: "",
    alt: "",
    placeholder: true,
  };

  async function action(formData: FormData) {
    setError(null);
    formData.set("image", JSON.stringify({
      src: formData.get("image_src"),
      alt: formData.get("image_alt"),
      placeholder: formData.get("image_placeholder") === "on",
    }));
    formData.set("streaming_links", JSON.stringify({
      spotify: formData.get("spotify") || undefined,
    }));
    try {
      await upsertArtist(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={String(artist.id)} />
      <Input label="Name" name="name" defaultValue={String(artist.name)} required />
      <Input label="Slug" name="slug" defaultValue={String(artist.slug)} required />
      <Input label="Tagline" name="tagline" defaultValue={String(artist.tagline ?? "")} />
      <Textarea label="Short bio" name="short_bio" defaultValue={String(artist.short_bio ?? "")} />
      <Textarea label="Long bio" name="long_bio" defaultValue={String(artist.long_bio ?? "")} />
      <div className="space-y-2">
        <label className="block text-sm text-text-secondary">Theme</label>
        <select
          name="theme"
          defaultValue={String(artist.theme)}
          className="w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
        >
          <option value="frost">Frost (Frostmark)</option>
          <option value="wolf">Wolf (Wolfyslayer)</option>
        </select>
      </div>
      <Input label="Portrait URL" name="image_src" defaultValue={image.src} />
      <Input label="Portrait alt" name="image_alt" defaultValue={image.alt} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="image_placeholder" defaultChecked={image.placeholder} />
        Placeholder image
      </label>
      <Input
        label="Spotify artist URL"
        name="spotify_artist_url"
        defaultValue={String(artist.spotify_artist_url ?? "")}
      />
      <Input label="Spotify (streaming link)" name="spotify" defaultValue="" />
      <div className="space-y-2">
        <label className="block text-sm text-text-secondary">Status</label>
        <select
          name="status"
          defaultValue={String(artist.status)}
          className="w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit">Save artist</Button>
    </form>
  );
}
