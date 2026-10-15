import { ContactForm } from "@/components/contact/contact-form";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { SocialLinks } from "@/components/layout/social-links";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${siteConfig.fullName}.`,
};

export default function ContactPage() {
  return (
    <div className="pt-24 md:pt-28">
      <Container className="grid gap-16 pb-20 md:grid-cols-2 md:pb-28">
        <div>
          <SectionHeader
            eyebrow="Reach out"
            title="Contact"
            description="General inquiries, licensing, and collaboration. We respond when we can."
            className="mb-8"
          />
          <SocialLinks />
          {siteConfig.contactEmail ? (
            <p className="mt-6 text-sm text-text-secondary">
              Email:{" "}
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
