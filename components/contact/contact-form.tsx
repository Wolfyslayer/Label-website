"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { useState } from "react";

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

export function ContactForm() {
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

  function translateServerError(code?: string) {
    if (!code) return tErr("generic");
    return tErr(code as "network");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrors({});
    setServerError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });

      const json = (await res.json()) as {
        ok?: boolean;
        fieldErrorCodes?: Record<string, string>;
        errorCode?: string;
      };

      if (res.ok && json.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      if (json.fieldErrorCodes) {
        const mapped: FieldErrors = {};
        for (const [key, code] of Object.entries(json.fieldErrorCodes)) {
          mapped[key as keyof FieldErrors] = translateFieldError(code);
        }
        setErrors(mapped);
      }
      setServerError(translateServerError(json.errorCode));
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
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
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
