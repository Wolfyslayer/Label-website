"use client";

import { LabelLogo } from "@/components/layout/label-logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteBrandPaths } from "@/lib/assets/site-brand";
import { siteConfig } from "@/lib/config/site";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function HomeHero() {
  const reduced = useReducedMotion();
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
          <Image
            src={siteBrandPaths.labelHeroBanner}
            alt=""
            fill
            className="object-cover object-[70%_20%] mix-blend-luminosity"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/92 to-void/55" />
        </div>
        <div className="absolute right-0 top-0 hidden h-full w-[min(42vw,520px)] opacity-40 md:block">
          <Image
            src={siteBrandPaths.labelHeroBanner}
            alt=""
            fill
            className="object-cover object-left-top mix-blend-luminosity"
            sizes="520px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-transparent" />
        </div>
      </div>

      <Container className="relative z-10">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl xl:max-w-4xl"
        >
          <div className="mb-8 md:hidden">
            <LabelLogo compact />
          </div>
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-accent-muted sm:text-xs">
            {siteConfig.fullName}
          </p>
          <h1 className="type-display text-balance text-text-primary">
            <span className="block">WOLFY</span>
            <span className="block text-silver">SLAYER</span>
          </h1>
          <p className="mt-6 max-w-xl text-balance leading-relaxed text-text-secondary">
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
        </motion.div>
      </Container>
    </section>
  );
}
