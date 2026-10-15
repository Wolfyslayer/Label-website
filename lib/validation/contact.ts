import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().email("Enter a valid email"),
  subject: z.string().trim().min(3, "Subject is required").max(200),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(5000),
  website: z.string().max(0, "Invalid submission").optional().or(z.literal("")),
});

export type ContactPayload = z.infer<typeof contactSchema>;
