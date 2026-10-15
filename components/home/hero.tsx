"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";
import { motion, useReducedMotion } from "framer-motion";

export function HomeHero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-[100dvh] items-end overflow-hidden pb-16 pt-28 md:items-center md:pb-24 md:pt-32">
      <div className="absolute inset-0 bg-charcoal">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_20%,rgba(142,180,201,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(196,165,116,0.08),transparent_55%)]" />
        <div className="noise-overlay absolute inset-0 opacity-40" />
        <div className="hero-vignette absolute inset-0" />
      </div>

      <Container className="relative z-10">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-accent-muted">
            {siteConfig.fullName}
          </p>
          <h1 className="font-display text-[clamp(2.75rem,10vw,6.5rem)] leading-[0.95] tracking-tight text-text-primary">
            <span className="block">WOLFY</span>
            <span className="block bg-gradient-to-r from-text-primary via-accent to-text-secondary bg-clip-text text-transparent">
              SLAYER
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
            {siteConfig.tagline} Cinematic releases from{" "}
            <span className="text-frost">Frostmark</span> and{" "}
            <span className="text-wolf">Wolfyslayer</span>.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/music" size="lg">
              Latest music
            </Button>
            <Button href="/artists" variant="outline" size="lg">
              Meet the artists
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          aria-hidden
        >
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-text-muted to-transparent" />
        </motion.div>
      </Container>
    </section>
  );
}
