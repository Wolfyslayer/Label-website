import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminNewsPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const { data: articles } = await supabase!
    .from("news")
    .select("id, title, slug, status, published_at")
    .order("published_at", { ascending: false });

  return (
    <main>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">News</h1>
          <p className="mt-1 text-sm text-text-muted">Localized announcements with cover images.</p>
        </div>
        <Link
          href="/admin/news/new"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border px-4 text-sm text-accent"
        >
          + New article
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-border-subtle">
        {(articles ?? []).map((article) => (
          <li key={article.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-text-primary">{article.title}</p>
              <p className="text-xs text-text-muted">
                {article.slug} · {article.status} · {article.published_at}
              </p>
            </div>
            <Link href={`/admin/news/${article.id}`} className="min-h-11 shrink-0 leading-[2.75rem] text-sm text-accent">
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
