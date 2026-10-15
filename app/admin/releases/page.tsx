import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminReleasesPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const { data: releases } = await supabase!
    .from("releases")
    .select("id, title, slug, status, release_date")
    .order("release_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Releases</h1>
        <Link href="/admin/releases/new" className="text-sm text-accent">
          + New release
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-border-subtle">
        {(releases ?? []).map((r) => (
          <li key={r.id} className="flex items-center justify-between py-4 text-sm">
            <div>
              <p className="text-text-primary">{r.title}</p>
              <p className="text-text-muted">
                {r.slug} · {r.status}
              </p>
            </div>
            <Link href={`/admin/releases/${r.id}`} className="text-accent">
              Edit
            </Link>
          </li>
        ))}
      </ul>
      {!releases?.length ? (
        <p className="mt-8 text-sm text-text-muted">No releases in database yet.</p>
      ) : null}
    </main>
  );
}
