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
    .select("id, title, slug, status, release_date, type")
    .order("release_at", { ascending: false });

  return (
    <main>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Releases</h1>
          <p className="mt-1 text-sm text-text-muted">Albums, EPs and singles with artwork and streaming links.</p>
        </div>
        <Link
          href="/admin/releases/new"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-4 text-sm text-accent"
        >
          + New release
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-border-subtle">
        {(releases ?? []).map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-4 py-4 text-sm">
            <div>
              <p className="text-text-primary">{r.title}</p>
              <p className="text-text-muted">
                {r.type} · {r.release_date} · {r.status}
              </p>
            </div>
            <Link href={`/admin/releases/${r.id}`} className="min-h-11 shrink-0 leading-[2.75rem] text-accent">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
