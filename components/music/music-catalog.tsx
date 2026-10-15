"use client";

import { CatalogEmptyState } from "@/components/music/catalog-empty-state";
import { ReleaseCard } from "@/components/music/release-card";
import { Input } from "@/components/ui/input";
import { sortReleases, type ReleaseSort } from "@/lib/content/discovery";
import { isReleaseUpcoming } from "@/lib/content/releases";
import type { Artist, Release } from "@/lib/types/content";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const typeFilters = ["all", "album", "single", "ep"] as const;

export function MusicCatalog({
  releases,
  artists,
}: {
  releases: Release[];
  artists: Artist[];
}) {
  const t = useTranslations("musicPage");
  const [query, setQuery] = useState("");
  const [artistId, setArtistId] = useState<string>("all");
  const [type, setType] = useState<(typeof typeFilters)[number]>("all");
  const [year, setYear] = useState<string>("all");
  const [sort, setSort] = useState<ReleaseSort>("newest");

  const years = useMemo(() => {
    const set = new Set(releases.map((r) => r.releaseDate.slice(0, 4)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [releases]);

  const artistById = useMemo(() => new Map(artists.map((a) => [a.id, a])), [artists]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = releases.filter((release) => {
      if (artistId !== "all" && release.artistId !== artistId) return false;
      if (type !== "all" && release.type !== type) return false;
      if (year !== "all" && !release.releaseDate.startsWith(year)) return false;
      if (!q) return true;
      return release.title.toLowerCase().includes(q);
    });
    return sortReleases(matched, sort);
  }, [releases, query, artistId, type, year, sort]);

  const hasActiveFilters =
    query.trim().length > 0 || artistId !== "all" || type !== "all" || year !== "all";

  const typeLabel = (filterType: (typeof typeFilters)[number]) => {
    if (filterType === "all") return t("allTypes");
    return t(`releaseTypes.${filterType}`);
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
        <Input
          label={t("search")}
          name="search"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="space-y-2">
          <label htmlFor="artist-filter" className="block text-sm text-text-secondary">
            {t("filterArtist")}
          </label>
          <select
            id="artist-filter"
            className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
          >
            <option value="all">{t("allArtists")}</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="year-filter" className="block text-sm text-text-secondary">
            {t("year")}
          </label>
          <select
            id="year-filter"
            className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="all">{t("allYears")}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="sort-filter" className="block text-sm text-text-secondary">
            {t("sort")}
          </label>
          <select
            id="sort-filter"
            className="min-h-11 w-full rounded-sm border border-border bg-charcoal px-4 py-3 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as ReleaseSort)}
          >
            <option value="newest">{t("sortNewest")}</option>
            <option value="oldest">{t("sortOldest")}</option>
          </select>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <span className="block text-sm text-text-secondary">{t("format")}</span>
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((filterType) => (
            <button
              key={filterType}
              type="button"
              onClick={() => setType(filterType)}
              className={cn(
                "min-h-11 rounded-sm border px-3 py-2 text-xs uppercase tracking-widest transition-colors",
                type === filterType
                  ? "border-accent-muted bg-surface-elevated text-text-primary"
                  : "border-border text-text-muted hover:text-text-secondary",
              )}
            >
              {typeLabel(filterType)}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-text-muted" aria-live="polite">
        {t("releaseCount", { count: filtered.length })}
      </p>

      {filtered.length ? (
        <div className="@container mt-8">
          <div className="album-grid">
            {filtered.map((release) => (
              <ReleaseCard
                key={release.id}
                release={release}
                artist={artistById.get(release.artistId)}
                isUpcoming={isReleaseUpcoming(release)}
              />
            ))}
          </div>
        </div>
      ) : (
        <CatalogEmptyState
          variant={releases.length === 0 && !hasActiveFilters ? "catalog" : "filters"}
        />
      )}
    </div>
  );
}
