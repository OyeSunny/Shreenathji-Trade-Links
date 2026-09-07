import 'server-only';
import { z } from 'zod';

const optionalEnvironmentValue = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (value) =>
          ['postgres:', 'postgresql:'].includes(new URL(value).protocol),
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
          message:
            'BETTER_AUTH_SECRET must be a cryptographically random value',
        },
      ),
    BETTER_AUTH_URL: z.string().url(),
    OWNER_EMAIL: z.string().trim().toLowerCase().email(),
    OWNER_SETUP_TOKEN: z.string().min(32).optional(),
    MAIL_FROM: z.string().trim().toLowerCase().email(),
    CONTACT_NOTIFICATION_TO: optionalEnvironmentValue.pipe(
      z.string().trim().toLowerCase().email().optional(),
    ),
    SMTP_HOST: optionalEnvironmentValue,
    SMTP_PORT: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.coerce.number().int().min(1).max(65_535).optional(),
    ),
    SMTP_USER: optionalEnvironmentValue.pipe(z.string().email().optional()),
    SMTP_PASSWORD: optionalEnvironmentValue,
  })
  .superRefine((value, context) => {
    const configuredFields = [
      value.SMTP_HOST,
      value.SMTP_PORT,
      value.SMTP_USER,
      value.SMTP_PASSWORD,
    ];
    const configuredCount = configuredFields.filter(Boolean).length;

    if (configuredCount > 0 && configuredCount < configuredFields.length) {
      context.addIssue({
        code: 'custom',
        message:
          'SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD must be configured together',
        path: ['SMTP_PASSWORD'],
      });
    }
  });

export type AppEnv = z.infer<typeof environmentSchema>;

export const parseEnv = (input: Record<string, string | undefined>): AppEnv =>
  environmentSchema.parse(input);

export const env = parseEnv(process.env);
