"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/config/site";
import { contactSchema, mapContactFieldErrors } from "@/lib/validation/contact";
import { useTranslations } from "next-intl";
import { useState } from "react";

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export function ContactForm({ privacyDescribedBy }: { privacyDescribedBy?: string }) {
  const t = useTranslations("contactForm");
  const tErr = useTranslations("contactErrors");
  const tVal = useTranslations("validation");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  function translateFieldError(code?: string) {
    if (!code) return undefined;
    return tVal(code as "nameMin");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrors({});
    setServerError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
    };

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      const mapped: FieldErrors = {};
      const codes = mapContactFieldErrors(parsed.error.issues);
      for (const [key, code] of Object.entries(codes)) {
        mapped[key as keyof FieldErrors] = translateFieldError(code);
      }
      setErrors(mapped);
      setStatus("error");
      return;
    }

    if (parsed.data.website) {
      setStatus("success");
      form.reset();
      return;
    }

    const endpoint = siteConfig.contactFormEndpoint;

    if (!endpoint) {
      setServerError(siteConfig.staticHosting ? tErr("staticOnly") : tErr("notConfigured"));
      setStatus("error");
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          subject: parsed.data.subject,
          message: parsed.data.message,
        }),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      setServerError(tErr("deliveryFailed"));
      setStatus("error");
    } catch {
      setServerError(tErr("network"));
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-sm border border-success/30 bg-success/10 p-6 text-sm text-text-primary"
        role="status"
      >
        {t("success")}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
      noValidate
      aria-describedby={privacyDescribedBy}
    >
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="website">{t("websiteHoneypot")}</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Input label={t("name")} name="name" required autoComplete="name" error={errors.name} />
      <Input
        label={t("email")}
        name="email"
        type="email"
        required
        autoComplete="email"
        error={errors.email}
      />
      <Input label={t("subject")} name="subject" required error={errors.subject} />
      <Textarea label={t("message")} name="message" required error={errors.message} />

      {serverError ? (
        <p className="text-sm text-danger" role="alert">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? t("sending") : t("send")}
      </Button>
    </form>
  );
}
