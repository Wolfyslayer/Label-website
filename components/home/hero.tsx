import { LabelLogo } from "@/components/layout/label-logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";
import { useTranslations } from "next-intl";


export function HomeHero() {
  const t = useTranslations("home");

  return (
    <section className="relative flex min-h-[100dvh] min-h-[100svh] items-end overflow-hidden pb-[max(4rem,env(safe-area-inset-bottom))] pt-[calc(var(--header-height)+env(safe-area-inset-top)+2rem)] md:items-center md:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-void">
        <div className="hero-light-frost absolute inset-0" />
        <div className="hero-light-wolf absolute inset-0" />
        <div className="noise-overlay absolute inset-0 opacity-50" />
        <div className="hero-vignette absolute inset-0" />
      </div>

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 opacity-[0.18] md:hidden">
          {/* Generated mobile-sized hero variant; decorative image stays lazy. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/banners/label-hero-768.webp"
            srcSet="/assets/banners/label-hero-480.webp 480w, /assets/banners/label-hero-768.webp 768w, /assets/banners/label-hero-1280x512.webp 1280w"
            alt=""
            width={1280}
            height={512}
            sizes="100vw"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[70%_20%] mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/92 to-void/55" />
        </div>
        <div className="absolute right-0 top-0 hidden h-full w-[min(42vw,520px)] opacity-40 md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/banners/label-hero-768.webp"
            srcSet="/assets/banners/label-hero-480.webp 480w, /assets/banners/label-hero-768.webp 768w, /assets/banners/label-hero-1280x512.webp 1280w"
            alt=""
            width={1280}
            height={512}
            sizes="520px"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-left-top mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
        </div>
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl xl:max-w-4xl">
          <div className="mb-8 md:hidden">
            <LabelLogo compact />
          </div>
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-accent-muted sm:text-xs">
            {siteConfig.fullName}
          </p>
          <h1 className="type-display text-text-primary">
            <span className="block">WOLFY</span>
            <span className="block text-silver">SLAYER</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {t("heroTagline")}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button href="/music" size="lg" className="min-h-12 w-full sm:w-auto">
              {t("latestMusic")}
            </Button>
            <Button href="/artists" variant="outline" size="lg" className="min-h-12 w-full sm:w-auto">
              {t("meetArtists")}
            </Button>
          </div>
          <div aria-hidden="true" className="mt-14 flex items-center gap-4 sm:mt-20"><span className="h-px w-12 bg-silver/45" /><span className="h-1.5 w-1.5 rotate-45 border border-silver/60" /><span className="h-px w-24 bg-silver/20" /></div>
        </div>
      </Container>
    </section>
  );
}
