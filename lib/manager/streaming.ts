import type { z } from "zod";
import type { streamingLinksSchema } from "@/lib/content/schemas";

type Streaming = z.infer<typeof streamingLinksSchema>;

export function compactStreaming(links: Streaming): Streaming {
  const out: Streaming = {};
  for (const [key, value] of Object.entries(links ?? {})) {
    if (typeof value === "string" && value.trim().startsWith("https://")) {
      (out as Record<string, string>)[key] = value.trim();
    }
  }
  return out;
}

export function compactSocial(links: Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(links ?? {})) {
    if (value?.trim().startsWith("https://")) out[key] = value.trim();
  }
  return out;
}
