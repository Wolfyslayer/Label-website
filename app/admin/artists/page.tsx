import { ArtistAdminForm } from "@/components/admin/artist-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminArtistsPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const { data: artists } = await supabase!.from("artists").select("*").order("name");

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-3xl">Artists</h1>
      <div className="mt-10 space-y-16">
        {(artists ?? []).map((artist) => (
          <section key={artist.id} className="border-t border-border-subtle pt-10">
            <h2 className="font-display text-xl">{artist.name}</h2>
            <div className="mt-6">
              <ArtistAdminForm artist={artist} />
            </div>
          </section>
        ))}
      </div>
      {!artists?.length ? (
        <p className="mt-8 text-sm text-text-muted">
          Seed artists via SQL or import from <code>lib/data/seed.ts</code>.
        </p>
      ) : null}
    </main>
  );
}
