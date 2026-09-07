import { z } from 'zod';

const optionalPhone = z
  .string()
  .trim()
  .max(40, 'Keep the phone number under 40 characters.')
  .transform((value) => value || undefined)
  .optional();

export const contactCaptureSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid business email address.')
    .max(254),
  phone: optionalPhone,
  consent: z.literal(true, {
    error: 'Please confirm that we may contact you.',
  }),
  website: z.string().trim().max(200).optional().default(''),
});

export type ContactCaptureInput = z.infer<typeof contactCaptureSchema>;
