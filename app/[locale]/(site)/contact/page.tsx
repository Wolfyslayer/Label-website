import { ContactEmailCta } from "@/components/contact/contact-email-cta";
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

const INQUIRY_KEYS = ["general", "collaborations", "licensing", "press"] as const;

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

            <div className="surface-panel mb-10 p-5 sm:p-8">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
                {t("emailHeading")}
              </h2>
              <ContactEmailCta
                email={contactEmail}
                sendLabel={t("sendEmail")}
                className="mt-4"
              />
            </div>

            <section className="mb-10" aria-labelledby="contact-topics-heading">
              <h2
                id="contact-topics-heading"
                className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-text-muted"
              >
                {t("topicsHeading")}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {INQUIRY_KEYS.map((key) => (
                  <li
                    key={key}
                    className="rounded-sm border border-border-subtle bg-charcoal/40 p-4 sm:p-5"
                  >
                    <h3 className="font-display text-base text-text-primary">
                      {t(`topics.${key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {t(`topics.${key}.body`)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {showSocial ? (
              <div className="mb-8">
                <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
                  {t("socialHeading")}
                </h2>
                <SocialLinks links={socialLinks} />
              </div>
            ) : null}

            {formEnabled ? (
              <p id="contact-privacy" className="text-sm leading-relaxed text-text-muted">
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
