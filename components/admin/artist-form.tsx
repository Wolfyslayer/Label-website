"use client";

import { DeleteEntityForm } from "@/components/admin/delete-entity-form";
import { FormStatus } from "@/components/admin/form-status";
import { LocalizedFieldGroup } from "@/components/admin/localized-field-group";
import { MediaUploadField } from "@/components/admin/media-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteArtist, upsertArtist } from "@/lib/admin/actions";
import type { LocalizedFormValue } from "@/lib/admin/types";
import { useState } from "react";

export type ArtistFormData = {
  id: string;
  slug: string;
  name: string;
  theme: string;
  status: string;
  spotify_artist_url: string;
  tagline: LocalizedFormValue;
  short_bio: LocalizedFormValue;
  long_bio: LocalizedFormValue;
  image: { src: string; alt: LocalizedFormValue; placeholder: boolean };
  hero_image: { src: string; alt: LocalizedFormValue; placeholder: boolean };
  streaming_links: Record<string, string>;
  social_links: Record<string, string>;
  featured_release_ids: string[];
};

export function ArtistAdminForm({
  artist,
  releases,
}: {
  artist: ArtistFormData;
  releases: { id: string; title: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [featuredIds, setFeaturedIds] = useState(artist.featured_release_ids.join(","));

  async function action(formData: FormData) {
    setError(null);
    setSuccess(null);
    formData.set("featured_release_ids", featuredIds);
    formData.set("image_placeholder", formData.get("image_placeholder") ? "on" : "");
    formData.set("hero_image_placeholder", formData.get("hero_image_placeholder") ? "on" : "");
    const result = await upsertArtist(formData);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(result.message);
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={artist.id} />
      <Input label="Name (official)" name="name" defaultValue={artist.name} required />
      <Input label="Slug" name="slug" defaultValue={artist.slug} required />

      <LocalizedFieldGroup label="Tagline" name="tagline" value={artist.tagline} requiredEn />
      <LocalizedFieldGroup label="Short biography" name="short_bio" value={artist.short_bio} multiline />
      <LocalizedFieldGroup label="Long biography" name="long_bio" value={artist.long_bio} multiline />

      <div className="space-y-2">
        <label htmlFor="theme" className="block text-sm text-text-secondary">
          Theme
        </label>
        <select
          id="theme"
          name="theme"
          defaultValue={artist.theme}
          className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
        >
          <option value="frost">Frost (Frostmark)</option>
          <option value="wolf">Wolf (Wolfyslayer)</option>
        </select>
      </div>

      <MediaUploadField
        label="Portrait"
        folder={`artists/${artist.id}`}
        urlFieldName="image_src"
        defaultUrl={artist.image.src}
        hint="Upload replaces the URL below. Official repo images under /artists/*.jpg are preserved until you change them."
      />
      <LocalizedFieldGroup label="Portrait alt text" name="image_alt" value={artist.image.alt} />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="image_placeholder" defaultChecked={artist.image.placeholder} />
        Mark portrait as placeholder
      </label>

      <MediaUploadField
        label="Banner / hero"
        folder={`artists/${artist.id}/hero`}
        urlFieldName="hero_image_src"
        defaultUrl={artist.hero_image.src}
      />
      <LocalizedFieldGroup label="Hero alt text" name="hero_image_alt" value={artist.hero_image.alt} />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="hero_image_placeholder" defaultChecked={artist.hero_image.placeholder} />
        Mark hero as placeholder
      </label>

      <Input
        label="Spotify artist URL"
        name="spotify_artist_url"
        defaultValue={artist.spotify_artist_url}
      />
      <Input
        label="Spotify (streaming link)"
        name="stream_spotify"
        defaultValue={artist.streaming_links.spotify ?? ""}
      />

      <fieldset className="space-y-3 rounded-sm border border-border-subtle p-4">
        <legend className="px-1 text-sm font-medium">Social links</legend>
        {(["instagram", "youtube", "facebook", "x", "tiktok"] as const).map((key) => (
          <Input
            key={key}
            label={key}
            name={`social_${key}`}
            defaultValue={artist.social_links[key] ?? ""}
          />
        ))}
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="featured_release_ids" className="block text-sm text-text-secondary">
          Featured release IDs (comma-separated)
        </label>
        <input
          id="featured_release_ids"
          className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
          value={featuredIds}
          onChange={(e) => setFeaturedIds(e.target.value)}
        />
        <p className="text-xs text-text-muted">
          Available: {releases.map((r) => `${r.title} (${r.id})`).join(" · ") || "none"}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="block text-sm text-text-secondary">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={artist.status}
          className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <FormStatus error={error} success={success} />
      <Button type="submit" className="min-h-12 w-full sm:w-auto">
        Save artist
      </Button>

      <DeleteEntityForm
        entityLabel="artist"
        id={artist.id}
        slug={artist.slug}
        deleteAction={deleteArtist}
      />
    </form>
  );
}
