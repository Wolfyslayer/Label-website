import { contactSchema, mapContactFieldErrors } from "@/lib/validation/contact";
import { rateLimit } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  const rl = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 15 * 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { errorCode: "rateLimit" },
      {
        status: 429,
        headers: rl.retryAfterMs
          ? { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) }
          : {},
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ errorCode: "invalidJson" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { fieldErrorCodes: mapContactFieldErrors(parsed.error.issues) },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  const supabase = await createServiceClient();

  if (supabase) {
    const { error } = await supabase.from("contact_submissions").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      ip_address: ip,
    });
    if (error) {
      console.error("contact insert", error);
      return NextResponse.json({ errorCode: "storeFailed" }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  }

  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          ip,
          source: "wolfyslayer-records-contact",
        }),
      });
      if (!res.ok) {
        return NextResponse.json({ errorCode: "deliveryFailed" }, { status: 503 });
      }
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ errorCode: "deliveryFailed" }, { status: 503 });
    }
  }

  return NextResponse.json({ errorCode: "notConfigured" }, { status: 503 });
}
