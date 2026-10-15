"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSettings } from "@/lib/admin/actions";
import { useState } from "react";

export function SettingsForm({
  settings,
  releases,
}: {
  settings: Record<string, unknown> | null;
  releases: { id: string; title: string }[];
}) {
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    try {
      await updateSiteSettings(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <form action={action} className="space-y-4">
      <Textarea
        label="Label story"
        name="label_story"
        defaultValue={String(settings?.label_story ?? "")}
      />
      <Textarea
        label="Label mission"
        name="label_mission"
        defaultValue={String(settings?.label_mission ?? "")}
      />
      <div className="space-y-2">
        <label htmlFor="featured_release_id" className="block text-sm text-text-secondary">
          Featured release
        </label>
        <select
          id="featured_release_id"
          name="featured_release_id"
          defaultValue={String(settings?.featured_release_id ?? "")}
          className="w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
        >
          <option value="">None</option>
          {releases.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit">Save settings</Button>
    </form>
  );
}
