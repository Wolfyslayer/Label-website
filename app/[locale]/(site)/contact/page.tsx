import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { SocialLinks } from "@/components/layout/social-links";
import { getPublicSocialLinks } from "@/lib/content/site-settings";
import {
  getPublicContactEmail,
  hasAnyPublicSocialLink,
  isContactFormEnabled,
} from "@/lib/config/public-contact";
import { buildAlternates } from "@/lib/metadata/alternates";
import { pageOpenGraph } from "@/lib/metadata/open-graph";
import { resolvePageLocale, type LocalePageParams } from "@/lib/i18n/page-locale";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: LocalePageParams): Promise<Metadata> {
  const locale = await resolvePageLocale(params);
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

export default async function ContactPage({ params }: LocalePageParams) {
  await resolvePageLocale(params);
  const t = await getTranslations("contactPage");
  const socialLinks = await getPublicSocialLinks();
  const formEnabled = isContactFormEnabled();
  const contactEmail = getPublicContactEmail();
  const showSocial = hasAnyPublicSocialLink(socialLinks);

  return (
    <div className="page-offset">
      <Container className="pb-20 md:pb-28">
        <div
          className={
            formEnabled
              ? "grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-20"
              : "mx-auto max-w-2xl"
          }
        >
          <div>
            <SectionHeader
              eyebrow={t("eyebrow")}
              title={t("title")}
              description={t("description")}
              className="mb-8"
              headingLevel={1}
            />

            {contactEmail ? (
              <div className="surface-panel mb-8 p-5 sm:p-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
                  {t("emailHeading")}
                </h2>
                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-3 inline-flex min-h-11 items-center font-display text-lg text-accent transition-colors hover:text-text-primary"
                >
                  {contactEmail}
                </a>
              </div>
            ) : null}

            {showSocial ? (
              <div className="mb-8">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
                  {t("socialHeading")}
                </h2>
                <SocialLinks links={socialLinks} />
              </div>
            ) : null}

            {!formEnabled && !contactEmail ? (
              <p className="text-sm leading-relaxed text-text-secondary">{t("unavailable")}</p>
            ) : null}

            {formEnabled ? (
              <p id="contact-privacy" className="mt-8 text-sm leading-relaxed text-text-muted">
                {t("privacyNoticeForm")}
              </p>
            ) : null}
          </div>

          {formEnabled ? (
            <div className="surface-panel p-6 sm:p-8">
              <h2 className="mb-6 font-display text-xl text-text-primary">{t("formHeading")}</h2>
              <ContactForm privacyDescribedBy="contact-privacy" enabled />
            </div>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
