"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message" | "website", string>>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

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
        fieldErrors?: FieldErrors;
        error?: string;
      };

      if (res.ok && json.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      if (json.fieldErrors) setErrors(json.fieldErrors);
      setServerError(json.error ?? "Unable to send message.");
      setStatus("error");
    } catch {
      setServerError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-sm border border-success/30 bg-success/10 p-6 text-sm text-text-primary"
        role="status"
      >
        Thank you — your message was received. We will respond when possible.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Honeypot — hidden from users */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Input label="Name" name="name" required autoComplete="name" error={errors.name} />
      <Input
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={errors.email}
      />
      <Input label="Subject" name="subject" required error={errors.subject} />
      <Textarea label="Message" name="message" required error={errors.message} />

      {serverError ? (
        <p className="text-sm text-danger" role="alert">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
