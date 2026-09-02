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
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  OWNER_EMAIL: z.string().trim().toLowerCase().email(),
  MAIL_FROM: z.string().trim().toLowerCase().email(),
});

export type AppEnv = z.infer<typeof environmentSchema>;

export const parseEnv = (input: Record<string, string | undefined>): AppEnv =>
  environmentSchema.parse(input);

export const env = parseEnv(process.env);
