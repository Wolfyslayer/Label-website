import { requireAdmin } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { seedContent } from "@/lib/data/seed";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSignOut } from "@/components/admin/sign-out";

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
          Supabase is not configured. The public site runs from typed seed data in{" "}
          <code>lib/data/seed.ts</code>. Follow README instructions to connect Supabase, run
          migrations, create an auth user, and add their UUID to{" "}
          <code>admin_users</code>.
        </p>
        <ul className="mt-8 space-y-2 text-sm text-text-secondary">
          <li>Artists (seed): {seedContent.artists.length}</li>
          <li>Releases (seed): {seedContent.releases.length}</li>
          <li>News (seed): {seedContent.news.length}</li>
        </ul>
      </main>
    );
  }

  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="font-display text-2xl">Access denied</h1>
        <p className="mt-4 text-sm text-text-secondary">
          Your account is not in the admin allowlist. Contact the label administrator.
        </p>
        <AdminSignOut className="mt-8" />
      </main>
    );
  }

  const links = [
    { href: "/admin/releases", label: "Releases" },
    { href: "/admin/artists", label: "Artists" },
    { href: "/admin/news", label: "News" },
    { href: "/admin/settings", label: "Site settings" },
  ];

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Dashboard</h1>
          <p className="mt-2 text-sm text-text-muted">Signed in as {user.email}</p>
        </div>
        <AdminSignOut />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-sm border border-border-subtle bg-surface/50 p-6 transition-colors hover:border-border"
          >
            <span className="font-display text-xl">{label}</span>
            <p className="mt-2 text-xs text-text-muted">Manage {label.toLowerCase()}</p>
          </Link>
        ))}
      </div>
      <p className="mt-10 text-xs text-text-muted">
        Upload media to the Supabase <code>media</code> bucket and paste public URLs into content
        records.
      </p>
    </main>
  );
}
