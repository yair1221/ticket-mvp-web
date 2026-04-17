import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const serverEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1).optional(),
  SUPPORT_EMAIL_TO: z.string().email().optional(),
  SUPPORT_EMAIL_FROM: z.string().email().optional(),
});

const rawPublic = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

const parsedPublic = publicEnvSchema.safeParse(rawPublic);

if (!parsedPublic.success) {
  const issues = parsedPublic.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `Invalid public environment variables:\n${issues}\n\nSee .env.example for the required values.`,
  );
}

export const publicEnv = parsedPublic.data;

export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SUPPORT_EMAIL_TO: process.env.SUPPORT_EMAIL_TO,
    SUPPORT_EMAIL_FROM: process.env.SUPPORT_EMAIL_FROM,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid server environment variables:\n${issues}`);
  }
  return parsed.data;
}
