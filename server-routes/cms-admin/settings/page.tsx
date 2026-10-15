import { SettingsForm } from "@/components/admin/settings-form";
import { rowLocalized } from "@/lib/admin/map-row";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { LocalizedString } from "@/lib/types/content";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const [{ data: settings }, { data: releases }, { data: news }] = await Promise.all([
    supabase!.from("site_settings").select("*").maybeSingle(),
    supabase!.from("releases").select("id, title").order("title"),
    supabase!.from("news").select("id, title").order("published_at", { ascending: false }),
  ]);

  const labelStory = rowLocalized(
    settings?.label_story_i18n as LocalizedString,
    settings?.label_story,
  );
  const labelMission = rowLocalized(
    settings?.label_mission_i18n as LocalizedString,
    settings?.label_mission,
  );

  return (
    <main>
      <h1 className="font-display text-3xl">Site settings</h1>
      <p className="mt-2 text-sm text-text-muted">Label copy, homepage highlights and social links.</p>
      <div className="mt-10 max-w-3xl">
        <SettingsForm
          labelStory={labelStory}
          labelMission={labelMission}
          settings={settings}
          releases={releases ?? []}
          news={news ?? []}
        />
      </div>
    </main>
  );
}
