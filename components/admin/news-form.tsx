"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { upsertNews } from "@/lib/admin/actions";
import { useState } from "react";

export function NewsAdminForm({ article }: { article?: Record<string, unknown> }) {
  const [error, setError] = useState<string | null>(null);
  const cover = (article?.cover as { src: string; alt: string; placeholder: boolean }) ?? {
    src: "/placeholders/news-default.svg",
    alt: "News",
    placeholder: true,
  };

  async function action(formData: FormData) {
    setError(null);
    formData.set("cover", JSON.stringify({
      src: formData.get("cover_src"),
      alt: formData.get("cover_alt"),
      placeholder: formData.get("cover_placeholder") === "on",
    }));
    try {
      await upsertNews(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <form action={action} className="space-y-4">
      {article?.id ? <input type="hidden" name="id" value={String(article.id)} /> : null}
      <Input label="Title" name="title" defaultValue={String(article?.title ?? "")} required />
      <Input label="Slug" name="slug" defaultValue={String(article?.slug ?? "")} required />
      <Input label="Excerpt" name="excerpt" defaultValue={String(article?.excerpt ?? "")} />
      <Textarea label="Body" name="body" defaultValue={String(article?.body ?? "")} />
      <Input
        label="Published at (ISO)"
        name="published_at"
        defaultValue={String(article?.published_at ?? new Date().toISOString())}
      />
      <Input label="Cover URL" name="cover_src" defaultValue={cover.src} />
      <Input label="Cover alt" name="cover_alt" defaultValue={cover.alt} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="cover_placeholder" defaultChecked={cover.placeholder} />
        Placeholder cover
      </label>
      <select
        name="status"
        defaultValue={String(article?.status ?? "draft")}
        className="w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit">Save article</Button>
    </form>
  );
}
