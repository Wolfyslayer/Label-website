import { Container } from "@/components/ui/container";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Merch | Wolfyslayer Records", description: "Official Wolfyslayer Records, Frostmark and Wolfyslayer merchandise." };

export default async function MerchPage() {
  const t = await getTranslations("merch");
  const collections = ["label", "frostmark", "wolfyslayer"] as const;
  return (
    <Container className="min-h-[75dvh] pb-24 pt-[calc(var(--header-height)+5rem)]">
      <p className="text-xs uppercase tracking-[0.25em] text-text-muted">{t("eyebrow")}</p>
      <h1 className="mt-5 font-display text-5xl text-text-primary md:text-7xl">{t("title")}</h1>
      <p className="mt-5 max-w-2xl text-text-secondary">{t("description")}</p>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {collections.map((key) => (
          <section key={key} className="surface-panel flex min-h-64 flex-col justify-end rounded-md border border-border-subtle p-6">
            <h2 className="font-display text-2xl text-text-primary">{t(key)}</h2>
            <p className="mt-3 text-sm text-text-muted">{t("soon")}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 text-sm text-text-muted" role="status">{t("notice")}</p>
    </Container>
  );
}
