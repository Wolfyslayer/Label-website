import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { SectionHeader } from "@/components/ui/section-header";
import { ReleaseCountdown } from "@/components/music/countdown";
import { Link } from "@/i18n/navigation";
import { getPublishedArtists, getUpcomingReleases } from "@/lib/content";
import { buildAlternates } from "@/lib/metadata/alternates";
import type { AppLocale } from "@/i18n/routing";
import { formatReleaseDate } from "@/lib/utils/date";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations({ locale, namespace: "upcomingPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/upcoming", locale),
  };
}

export default async function UpcomingPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("upcomingPage");
  const dateLocale = locale === "sv" ? "sv-SE" : "en-US";

  const [upcoming, artists] = await Promise.all([
    getUpcomingReleases(locale),
    getPublishedArtists(locale),
  ]);
  const artistById = new Map(artists.map((a) => [a.id, a]));

  return (
    <div className="pt-24 md:pt-28">
      <Container className="pb-20 md:pb-28">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        {upcoming.length ? (
          <ul className="space-y-10">
            {upcoming.map((release) => {
              const artist = artistById.get(release.artistId);
              return (
                <li
                  key={release.id}
                  className="grid gap-8 rounded-sm border border-border-subtle bg-surface/40 p-6 md:grid-cols-[200px_1fr] md:p-10 lg:grid-cols-[240px_1fr_auto]"
                >
                  <div className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-sm ring-1 ring-border">
                    {release.cover.placeholder ? <PlaceholderBanner /> : null}
                    <Image src={release.cover.src} alt={release.cover.alt} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted">
                      {artist?.name} · {release.type}
                    </p>
                    <h2 className="mt-2 font-display text-3xl md:text-4xl">{release.title}</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      {formatReleaseDate(release.releaseDate, dateLocale)}
                    </p>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-secondary">
                      {release.description}
                    </p>
                    {release.preSaveUrl ? (
                      <div className="mt-6">
                        <Button href={release.preSaveUrl} external size="sm">
                          {t("preSave")}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-start lg:items-center">
                    <ReleaseCountdown releaseAt={release.releaseAt} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-text-secondary">
            {t.rich("empty", {
              catalog: (chunks) => (
                <Link href="/music" className="text-accent underline-offset-4 hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        )}
      </Container>
    </div>
  );
}
