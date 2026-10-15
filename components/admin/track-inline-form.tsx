"use client";

import { DeleteEntityForm } from "@/components/admin/delete-entity-form";
import { FormStatus } from "@/components/admin/form-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteTrack, upsertTrack } from "@/lib/admin/actions";
import { useState } from "react";

export function TrackInlineForm({
  track,
  artistId,
  releaseId,
}: {
  track?: {
    id: string;
    slug: string;
    title: string;
    track_number: number;
    duration_seconds?: number | null;
    spotify_track_url?: string | null;
  };
  artistId: string;
  releaseId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    setSuccess(null);
    formData.set("artist_id", artistId);
    formData.set("release_id", releaseId);
    const result = await upsertTrack(formData);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(result.message);
  }

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {track?.id ? <input type="hidden" name="id" value={track.id} /> : null}
      <Input label="Track title (official)" name="title" defaultValue={track?.title} required />
      <Input label="Slug" name="slug" defaultValue={track?.slug} required />
      <Input
        label="Track #"
        name="track_number"
        type="number"
        defaultValue={String(track?.track_number ?? 1)}
        required
      />
      <Input
        label="Duration (seconds)"
        name="duration_seconds"
        type="number"
        defaultValue={track?.duration_seconds ? String(track.duration_seconds) : ""}
      />
      <Input
        label="Spotify track URL"
        name="spotify_track_url"
        defaultValue={track?.spotify_track_url ?? ""}
        className="sm:col-span-2"
      />
      <div className="sm:col-span-2">
        <FormStatus error={error} success={success} />
        <Button type="submit" size="sm" className="mt-2 min-h-11">
          {track ? "Update track" : "Add track"}
        </Button>
        {track ? (
          <DeleteEntityForm
            entityLabel="track"
            id={track.id}
            slug={track.slug}
            deleteAction={deleteTrack}
          />
        ) : null}
      </div>
    </form>
  );
}
