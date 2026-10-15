import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { SocialLinks } from "@/components/layout/social-links";
import { getPublicSocialLinks } from "@/lib/content/site-settings";
import { siteConfig } from "@/lib/config/site";
import { buildAlternates } from "@/lib/metadata/alternates";
import { pageOpenGraph } from "@/lib/metadata/open-graph";
import type { AppLocale } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: buildAlternates("/contact", locale),
    ...pageOpenGraph({ title, description, locale, pathname: "/contact" }),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contactPage");
  const socialLinks = await getPublicSocialLinks();

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
          <SocialLinks links={socialLinks} />
          {siteConfig.contactEmail ? (
            <p className="mt-6 text-sm text-text-secondary">
              {t("emailLabel")}:{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="text-accent">
                {siteConfig.contactEmail}
              </a>
            </p>
          ) : null}
          <p id="contact-privacy" className="mt-8 text-sm leading-relaxed text-text-muted">
            {t("privacyNotice")}
          </p>
        </div>
        <div className="relative">
          <ContactForm privacyDescribedBy="contact-privacy" />
        </div>
      </Container>
    </div>
  );
}
