import { ReleaseForm } from "@/components/admin/release-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditReleasePage({ params }: Props) {
  const { id } = await params;
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const [{ data: release }, { data: artists }] = await Promise.all([
    supabase!.from("releases").select("*").eq("id", id).maybeSingle(),
    supabase!.from("artists").select("id, name"),
  ]);

  if (!release) notFound();

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <h1 className="font-display text-3xl">Edit release</h1>
      <div className="mt-8">
        <ReleaseForm
          artists={artists ?? []}
          release={{
            ...release,
            artist_id: release.artist_id,
            streaming_links: release.streaming_links as Record<string, string>,
            cover: release.cover as { src: string; alt: string; placeholder: boolean },
          }}
        />
      </div>
    </main>
  );
}
