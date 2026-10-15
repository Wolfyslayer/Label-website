import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { SocialLinks } from "@/components/layout/social-links";
import { siteConfig } from "@/lib/config/site";
import { buildAlternates } from "@/lib/metadata/alternates";
import type { AppLocale } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/contact", locale),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contactPage");

  return (
    <div className="pt-24 md:pt-28">
      <Container className="grid gap-16 pb-20 md:grid-cols-2 md:pb-28">
        <div>
          <SectionHeader
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
            className="mb-8"
          />
          <SocialLinks />
          {siteConfig.contactEmail ? (
            <p className="mt-6 text-sm text-text-secondary">
              {t("emailLabel")}:{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="text-accent">
                {siteConfig.contactEmail}
              </a>
            </p>
          ) : null}
        </div>
        <div className="relative">
          <ContactForm />
        </div>
      </Container>
    </div>
  );
}
