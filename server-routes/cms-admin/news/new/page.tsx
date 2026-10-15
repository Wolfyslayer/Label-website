import { NewsAdminForm } from "@/components/admin/news-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminNewsNewPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const [{ data: artists }, { data: releases }] = await Promise.all([
    supabase!.from("artists").select("id, name"),
    supabase!.from("releases").select("id, title"),
  ]);

  return (
    <main>
      <Link href="/admin/news" className="text-xs text-accent">
        ← News
      </Link>
      <h1 className="mt-4 font-display text-3xl">New article</h1>
      <div className="mt-10 max-w-3xl">
        <NewsAdminForm artists={artists ?? []} releases={releases ?? []} />
      </div>
    </main>
  );
}
