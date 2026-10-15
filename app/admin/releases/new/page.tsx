import { ReleaseForm } from "@/components/admin/release-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewReleasePage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const { data: artists } = await supabase!.from("artists").select("id, name");

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <h1 className="font-display text-3xl">New release</h1>
      <div className="mt-8">
        <ReleaseForm artists={artists ?? []} />
      </div>
    </main>
  );
}
