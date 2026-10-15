import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminArtistsPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const { data: artists } = await supabase!.from("artists").select("id, name, slug, status").order("name");

  return (
    <main>
      <h1 className="font-display text-3xl">Artists</h1>
      <p className="mt-2 text-sm text-text-muted">Manage biographies, portraits, streaming and social links.</p>
      <ul className="mt-8 divide-y divide-border-subtle">
        {(artists ?? []).map((artist) => (
          <li key={artist.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-text-primary">{artist.name}</p>
              <p className="text-xs text-text-muted">
                {artist.slug} · {artist.status}
              </p>
            </div>
            <Link href={`/admin/artists/${artist.id}`} className="min-h-11 shrink-0 leading-[2.75rem] text-sm text-accent">
              Edit
            </Link>
          </li>
        ))}
      </ul>
      {!artists?.length ? (
        <p className="mt-8 text-sm text-text-muted">
          No artists in the database. Run optional <code>supabase/seed-from-app.sql</code> or insert rows manually — existing seed file data is not overwritten automatically.
        </p>
      ) : null}
    </main>
  );
}
