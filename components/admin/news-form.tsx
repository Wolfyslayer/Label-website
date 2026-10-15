"use client";

import { DeleteEntityForm } from "@/components/admin/delete-entity-form";
import { FormStatus } from "@/components/admin/form-status";
import { LocalizedFieldGroup } from "@/components/admin/localized-field-group";
import { MediaUploadField } from "@/components/admin/media-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteNews, upsertNews } from "@/lib/admin/actions";
import type { LocalizedFormValue } from "@/lib/admin/types";
import { useState } from "react";

export type NewsFormData = {
  id?: string;
  slug?: string;
  title: LocalizedFormValue;
  excerpt: LocalizedFormValue;
  body: LocalizedFormValue;
  published_at?: string;
  status?: string;
  cover: { src: string; alt: LocalizedFormValue; placeholder: boolean };
  artist_id?: string | null;
  release_id?: string | null;
};

export function NewsAdminForm({
  article,
  artists,
  releases,
}: {
  article?: NewsFormData;
  artists: { id: string; name: string }[];
  releases: { id: string; title: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    setSuccess(null);
    const result = await upsertNews(formData);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(result.message);
  }

  return (
    <form action={action} className="space-y-6">
      {article?.id ? <input type="hidden" name="id" value={article.id} /> : null}
      <LocalizedFieldGroup label="Title" name="title" value={article?.title ?? { en: "", sv: "" }} requiredEn />
      <Input label="Slug" name="slug" defaultValue={article?.slug} required />
      <LocalizedFieldGroup label="Excerpt" name="excerpt" value={article?.excerpt ?? { en: "", sv: "" }} multiline />
      <LocalizedFieldGroup label="Body" name="body" value={article?.body ?? { en: "", sv: "" }} multiline />
      <Input
        label="Published at (ISO)"
        name="published_at"
        defaultValue={article?.published_at ?? new Date().toISOString()}
      />

      <MediaUploadField
        label="Cover image"
        folder={`news/${article?.id ?? "new"}`}
        urlFieldName="cover_src"
        defaultUrl={article?.cover.src}
      />
      <LocalizedFieldGroup label="Cover alt" name="cover_alt" value={article?.cover.alt ?? { en: "", sv: "" }} />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="cover_placeholder" defaultChecked={article?.cover.placeholder ?? true} />
        Placeholder cover
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm text-text-secondary">Related artist</label>
          <select
            name="artist_id"
            defaultValue={article?.artist_id ?? ""}
            className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
          >
            <option value="">None</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-text-secondary">Related release</label>
          <select
            name="release_id"
            defaultValue={article?.release_id ?? ""}
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
      </div>

      <select
        name="status"
        defaultValue={article?.status ?? "draft"}
        className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      <FormStatus error={error} success={success} />
      <Button type="submit" className="min-h-12 w-full sm:w-auto">
        Save article
      </Button>

      {article?.id && article.slug ? (
        <DeleteEntityForm
          entityLabel="article"
          id={article.id}
          slug={article.slug}
          deleteAction={deleteNews}
        />
      ) : null}
    </form>
  );
}
