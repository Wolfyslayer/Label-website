import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const { data: settings } = await supabase!.from("site_settings").select("*").maybeSingle();
  const { data: releases } = await supabase!.from("releases").select("id, title");

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <h1 className="font-display text-3xl">Site settings</h1>
      <div className="mt-8">
        <SettingsForm settings={settings} releases={releases ?? []} />
      </div>
    </main>
  );
}
