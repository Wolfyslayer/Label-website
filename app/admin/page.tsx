import { requireAdmin } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) {
    return (
      <main>
        <h1 className="font-display text-3xl">Access denied</h1>
        <p className="mt-4 text-sm text-text-secondary">
          Your account is not in the <code>admin_users</code> allowlist.
        </p>
      </main>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <main>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="mt-4 text-sm text-text-secondary">
          Configure Supabase environment variables to enable the CMS. Public pages still use seed data.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const [artists, releases, tracks, news, upcoming] = await Promise.all([
    supabase!.from("artists").select("id", { count: "exact", head: true }),
    supabase!.from("releases").select("id", { count: "exact", head: true }),
    supabase!.from("tracks").select("id", { count: "exact", head: true }),
    supabase!.from("news").select("id", { count: "exact", head: true }),
    supabase!
      .from("releases")
      .select("id", { count: "exact", head: true })
      .gt("release_at", new Date().toISOString()),
  ]);

  const cards = [
    { label: "Artists", count: artists.count ?? 0, href: "/admin/artists" },
    { label: "Releases", count: releases.count ?? 0, href: "/admin/releases" },
    { label: "Tracks", count: tracks.count ?? 0, href: "/admin/tracks" },
    { label: "Upcoming", count: upcoming.count ?? 0, href: "/admin/upcoming" },
    { label: "News", count: news.count ?? 0, href: "/admin/news" },
    { label: "Settings", href: "/admin/settings" },
  ];

  return (
    <main>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Signed in as {user.email}. Changes persist to Supabase and appear on the public site when published.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-sm border border-border-subtle bg-surface/40 p-6 transition-colors hover:border-accent-muted"
          >
            <p className="text-xs uppercase tracking-widest text-text-muted">{card.label}</p>
            {"count" in card ? (
              <p className="mt-2 font-display text-4xl text-text-primary">{card.count}</p>
            ) : (
              <p className="mt-2 text-sm text-accent">Open →</p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
