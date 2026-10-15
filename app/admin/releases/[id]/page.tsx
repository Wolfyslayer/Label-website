import { ReleaseForm, type ReleaseFormData } from "@/components/admin/release-form";
import { parseImageField, rowLocalized } from "@/lib/admin/map-row";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { LocalizedString } from "@/lib/types/content";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditReleasePage({ params }: Props) {
  const { id } = await params;
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const [{ data: release }, { data: artists }, { data: tracks }] = await Promise.all([
    supabase!.from("releases").select("*").eq("id", id).maybeSingle(),
    supabase!.from("artists").select("id, name"),
    supabase!.from("tracks").select("*").eq("release_id", id).order("track_number"),
  ]);

  if (!release) notFound();

  const cover = parseImageField(release.cover);
  const formRelease: ReleaseFormData = {
    id: release.id,
    slug: release.slug,
    title: release.title,
    artist_id: release.artist_id,
    type: release.type,
    release_date: release.release_date,
    release_at: release.release_at,
    status: release.status,
    spotify_album_url: release.spotify_album_url ?? "",
    pre_save_url: release.pre_save_url ?? "",
    featured: release.featured,
    description: rowLocalized(release.description_i18n as LocalizedString, release.description),
    credits: rowLocalized(release.credits_i18n as LocalizedString, release.credits),
    cover: { src: cover.src, alt: cover.alt, placeholder: cover.placeholder },
    streaming_links: (release.streaming_links as Record<string, string>) ?? {},
    track_ids: release.track_ids ?? [],
  };

  return (
    <main>
      <Link href="/admin/releases" className="text-xs text-accent">
        ← Releases
      </Link>
      <h1 className="mt-4 font-display text-3xl">Edit release</h1>
      <div className="mt-10 max-w-3xl">
        <ReleaseForm artists={artists ?? []} release={formRelease} tracks={tracks ?? []} />
      </div>
    </main>
  );
}
