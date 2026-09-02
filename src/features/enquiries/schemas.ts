import { z } from 'zod';

const optionalText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength)
    .transform((value) => value || undefined)
    .optional();

export const enquirySchema = z.object({
  type: z.enum(['DOMESTIC', 'EXPORT']),
  contactName: z.string().trim().min(2).max(100),
  companyName: optionalText(160),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: optionalText(32),
  whatsapp: optionalText(32),
  countryCode: optionalText(2).transform((value) => value?.toUpperCase()),
  city: optionalText(100),
  destinationCountry: optionalText(100),
  destinationPort: optionalText(100),
  incoterm: optionalText(20),
  materialRequest: z.string().trim().min(5).max(2000),
  quantity: optionalText(30),
  unit: optionalText(20),
  website: z.string().max(0).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
