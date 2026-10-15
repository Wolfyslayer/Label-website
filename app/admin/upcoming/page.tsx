import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminUpcomingPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: upcoming } = await supabase!
    .from("releases")
    .select("id, title, slug, release_at, release_date, status, pre_save_url, artists(name)")
    .gt("release_at", now)
    .order("release_at", { ascending: true });

  return (
    <main>
      <h1 className="font-display text-3xl">Upcoming releases</h1>
      <p className="mt-2 text-sm text-text-muted">
        Scheduled releases use <code className="text-text-secondary">release_at</code> (UTC). Edit dates and pre-save links on each release.
      </p>
      <ul className="mt-8 divide-y divide-border-subtle">
        {(upcoming ?? []).map((r) => (
          <li key={r.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-text-primary">{r.title}</p>
              <p className="text-xs text-text-muted">
                {Array.isArray(r.artists) ? r.artists[0]?.name : (r.artists as { name: string } | null)?.name} ·{" "}
                {r.release_at} · {r.status}
              </p>
              {r.pre_save_url ? (
                <p className="text-xs text-text-secondary">Pre-save configured</p>
              ) : (
                <p className="text-xs text-text-muted">No pre-save URL</p>
              )}
            </div>
            <Link href={`/admin/releases/${r.id}`} className="min-h-11 text-sm text-accent">
              Edit release
            </Link>
          </li>
        ))}
      </ul>
      {!upcoming?.length ? (
        <p className="mt-8 text-sm text-text-muted">No upcoming releases scheduled.</p>
      ) : null}
    </main>
  );
}
