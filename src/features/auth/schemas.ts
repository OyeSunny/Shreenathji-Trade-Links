import { z } from 'zod';

const commonPasswords = new Set([
  '12345678901234',
  'adminadminadmin',
  'passwordpassword',
  'qwertyuiopasdf',
  'welcome1234567',
]);

export const ownerEmailSchema = z.string().trim().toLowerCase().email();

export const ownerPasswordSchema = z
  .string()
  .min(14)
  .max(128)
  .refine((value) => !commonPasswords.has(value.toLowerCase()), {
    message: 'Choose a less common password',
  });

export const loginSchema = z.object({
  email: ownerEmailSchema,
  password: z.string().min(1),
});

export const totpSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});
