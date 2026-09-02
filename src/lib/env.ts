import 'server-only';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (value) => ['postgres:', 'postgresql:'].includes(new URL(value).protocol),
      {
        message: 'DATABASE_URL must use the PostgreSQL protocol',
      },
    ),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32)
    .refine(
      (value) =>
        value !== 'replace-with-a-random-secret-of-at-least-32-characters',
      {
        message: 'BETTER_AUTH_SECRET must be a cryptographically random value',
      },
    ),
  BETTER_AUTH_URL: z.string().url(),
  OWNER_EMAIL: z.string().trim().toLowerCase().email(),
  OWNER_SETUP_TOKEN: z.string().min(32).optional(),
  MAIL_FROM: z.string().trim().toLowerCase().email(),
});

export type AppEnv = z.infer<typeof environmentSchema>;

export const parseEnv = (input: Record<string, string | undefined>): AppEnv =>
  environmentSchema.parse(input);

export const env = parseEnv(process.env);
