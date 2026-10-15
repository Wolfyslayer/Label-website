import { ReleaseForm } from "@/components/admin/release-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewReleasePage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const { data: artists } = await supabase!.from("artists").select("id, name");

  return (
    <main>
      <Link href="/admin/releases" className="text-xs text-accent">
        ← Releases
      </Link>
      <h1 className="mt-4 font-display text-3xl">New release</h1>
      <div className="mt-10 max-w-3xl">
        <ReleaseForm artists={artists ?? []} />
      </div>
    </main>
  );
}
