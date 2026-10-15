import { z } from "zod";

export const contactFieldErrorCodes = {
  name: { too_short: "nameMin" },
  email: { invalid: "emailInvalid" },
  subject: { too_short: "subjectMin" },
  message: { too_short: "messageMin" },
} as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(20).max(5000),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactPayload = z.infer<typeof contactSchema>;

export function mapContactFieldErrors(
  issues: z.ZodIssue[],
): Partial<Record<"name" | "email" | "subject" | "message", string>> {
  const out: Partial<Record<"name" | "email" | "subject" | "message", string>> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (key !== "name" && key !== "email" && key !== "subject" && key !== "message") continue;
    if (out[key]) continue;
    if (key === "name" && issue.code === "too_small") out.name = "nameMin";
    if (key === "email") out.email = "emailInvalid";
    if (key === "subject" && issue.code === "too_small") out.subject = "subjectMin";
    if (key === "message" && issue.code === "too_small") out.message = "messageMin";
  }
  return out;
}
