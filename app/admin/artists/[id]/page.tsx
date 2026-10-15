import { ArtistAdminForm, type ArtistFormData } from "@/components/admin/artist-form";
import { parseImageField, rowLocalized } from "@/lib/admin/map-row";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { LocalizedString } from "@/lib/types/content";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function AdminArtistEditPage({ params }: Props) {
  const { id } = await params;
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const { data: artist } = await supabase!.from("artists").select("*").eq("id", id).maybeSingle();
  if (!artist) notFound();

  const { data: releases } = await supabase!.from("releases").select("id, title").order("title");

  const image = parseImageField(artist.image);
  const hero = parseImageField(artist.hero_image);

  const formData: ArtistFormData = {
    id: artist.id,
    slug: artist.slug,
    name: artist.name,
    theme: artist.theme,
    status: artist.status,
    spotify_artist_url: artist.spotify_artist_url ?? "",
    tagline: rowLocalized(artist.tagline_i18n as LocalizedString, artist.tagline),
    short_bio: rowLocalized(artist.short_bio_i18n as LocalizedString, artist.short_bio),
    long_bio: rowLocalized(artist.long_bio_i18n as LocalizedString, artist.long_bio),
    image: {
      src: image.src,
      alt: image.alt,
      placeholder: image.placeholder,
    },
    hero_image: {
      src: hero.src || image.src,
      alt: hero.alt.en ? hero.alt : image.alt,
      placeholder: hero.placeholder,
    },
    streaming_links: (artist.streaming_links as Record<string, string>) ?? {},
    social_links: (artist.social_links as Record<string, string>) ?? {},
    featured_release_ids: artist.featured_release_ids ?? [],
  };

  return (
    <main>
      <Link href="/admin/artists" className="text-xs text-accent">
        ← Artists
      </Link>
      <h1 className="mt-4 font-display text-3xl">{artist.name}</h1>
      <div className="mt-10 max-w-3xl">
        <ArtistAdminForm artist={formData} releases={releases ?? []} />
      </div>
    </main>
  );
}
