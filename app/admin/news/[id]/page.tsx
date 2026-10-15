import { NewsAdminForm, type NewsFormData } from "@/components/admin/news-form";
import { parseImageField, rowLocalized } from "@/lib/admin/map-row";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { LocalizedString } from "@/lib/types/content";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function AdminNewsEditPage({ params }: Props) {
  const { id } = await params;
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/admin/login");
  if (!isAdmin) redirect("/admin");

  const supabase = await createClient();
  const [{ data: article }, { data: artists }, { data: releases }] = await Promise.all([
    supabase!.from("news").select("*").eq("id", id).maybeSingle(),
    supabase!.from("artists").select("id, name"),
    supabase!.from("releases").select("id, title"),
  ]);

  if (!article) notFound();

  const cover = parseImageField(article.cover);
  const formArticle: NewsFormData = {
    id: article.id,
    slug: article.slug,
    title: rowLocalized(article.title_i18n as LocalizedString, article.title),
    excerpt: rowLocalized(article.excerpt_i18n as LocalizedString, article.excerpt),
    body: rowLocalized(article.body_i18n as LocalizedString, article.body),
    published_at: article.published_at,
    status: article.status,
    artist_id: article.artist_id,
    release_id: article.release_id,
    cover: { src: cover.src, alt: cover.alt, placeholder: cover.placeholder },
  };

  return (
    <main>
      <Link href="/admin/news" className="text-xs text-accent">
        ← News
      </Link>
      <h1 className="mt-4 font-display text-3xl">Edit article</h1>
      <div className="mt-10 max-w-3xl">
        <NewsAdminForm article={formArticle} artists={artists ?? []} releases={releases ?? []} />
      </div>
    </main>
  );
}
