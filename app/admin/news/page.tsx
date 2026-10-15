import { NewsAdminForm } from "@/components/admin/news-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminNewsPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const { data: articles } = await supabase!.from("news").select("*").order("published_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-3xl">News</h1>
      <section className="mt-10 border border-border-subtle p-6">
        <h2 className="text-lg">New article</h2>
        <div className="mt-4">
          <NewsAdminForm />
        </div>
      </section>
      <ul className="mt-12 space-y-12">
        {(articles ?? []).map((article) => (
          <li key={article.id} className="border-t border-border-subtle pt-10">
            <NewsAdminForm article={article} />
          </li>
        ))}
      </ul>
    </main>
  );
}
