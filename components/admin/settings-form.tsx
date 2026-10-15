"use client";

import { FormStatus } from "@/components/admin/form-status";
import { LocalizedFieldGroup } from "@/components/admin/localized-field-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSiteSettings } from "@/lib/admin/actions";
import type { LocalizedFormValue } from "@/lib/admin/types";
import { useState } from "react";

export function SettingsForm({
  labelStory,
  labelMission,
  settings,
  releases,
  news,
}: {
  labelStory: LocalizedFormValue;
  labelMission: LocalizedFormValue;
  settings: Record<string, unknown> | null;
  releases: { id: string; title: string }[];
  news: { id: string; title: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const social = (settings?.social_links as Record<string, string>) ?? {};

  async function action(formData: FormData) {
    setError(null);
    setSuccess(null);
    const result = await updateSiteSettings(formData);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(result.message);
  }

  return (
    <form action={action} className="space-y-6">
      <LocalizedFieldGroup label="Label story" name="label_story" value={labelStory} multiline requiredEn />
      <LocalizedFieldGroup label="Label mission" name="label_mission" value={labelMission} multiline requiredEn />

      <div className="space-y-2">
        <label htmlFor="featured_release_id" className="block text-sm text-text-secondary">
          Homepage featured release
        </label>
        <select
          id="featured_release_id"
          name="featured_release_id"
          defaultValue={String(settings?.featured_release_id ?? "")}
          className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
        >
          <option value="">None</option>
          {releases.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="homepage_featured_news_ids" className="block text-sm text-text-secondary">
          Homepage featured news IDs (comma-separated)
        </label>
        <Input
          label="News IDs"
          id="homepage_featured_news_ids"
          name="homepage_featured_news_ids"
          defaultValue={((settings?.homepage_featured_news_ids as string[]) ?? []).join(",")}
        />
        <p className="text-xs text-text-muted">
          {news.map((n) => `${n.title} (${n.id})`).join(" · ") || "No news rows yet"}
        </p>
      </div>

      <fieldset className="space-y-3 rounded-sm border border-border-subtle p-4">
        <legend className="px-1 text-sm font-medium">Social links (override env when set)</legend>
        {(["instagram", "youtube", "facebook", "x", "tiktok"] as const).map((key) => (
          <Input key={key} label={key} name={`social_${key}`} defaultValue={social[key] ?? ""} />
        ))}
      </fieldset>

      <FormStatus error={error} success={success} />
      <Button type="submit" className="min-h-12 w-full sm:w-auto">
        Save settings
      </Button>
    </form>
  );
}
