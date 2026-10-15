import { TrackInlineForm } from "@/components/admin/track-inline-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminTracksPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const { data: tracks } = await supabase!
    .from("tracks")
    .select("*, releases(title), artists(name)")
    .order("track_number");

  return (
    <main>
      <h1 className="font-display text-3xl">Tracks</h1>
      <p className="mt-2 text-sm text-text-muted">
        Edit tracklists here or from each release page. Official song titles are not translated.
      </p>
      <ul className="mt-8 space-y-6">
        {(tracks ?? []).map((track) => (
          <li key={track.id} className="rounded-sm border border-border-subtle p-4">
            <p className="mb-3 text-xs text-text-muted">
              {(track.artists as { name: string } | null)?.name ?? "Artist"} ·{" "}
              {(track.releases as { title: string } | null)?.title ?? "Release"}{" "}
              <Link href={`/admin/releases/${track.release_id}`} className="text-accent">
                Edit release
              </Link>
            </p>
            <TrackInlineForm
              track={track}
              artistId={track.artist_id}
              releaseId={track.release_id}
            />
          </li>
        ))}
      </ul>
      {!tracks?.length ? <p className="mt-8 text-sm text-text-muted">No tracks yet.</p> : null}
    </main>
  );
}
