import { z } from 'zod';

const emptyToUndefined = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength)
    .transform((value) => value || undefined)
    .optional();

const optionalDate = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .pipe(z.iso.datetime({ offset: true }).optional());

export const createOfferSchema = z
  .object({
    productId: z.string().cuid(),
    title: z.string().trim().min(4).max(140),
    summary: z.string().trim().min(10).max(500),
    details: emptyToUndefined(4000),
    startsAt: optionalDate,
    endsAt: optionalDate,
  })
  .superRefine((input, context) => {
    if (
      input.startsAt &&
      input.endsAt &&
      new Date(input.endsAt).getTime() <= new Date(input.startsAt).getTime()
    ) {
      context.addIssue({
        code: 'custom',
        message: 'The end date must be later than the start date.',
        path: ['endsAt'],
      });
    }
  });

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const updateOfferSchema = z
  .object({ offerId: z.string().cuid() })
  .and(createOfferSchema);

const dateTimeFromForm = (
  value: FormDataEntryValue | null,
  { endOfDay = false }: { endOfDay?: boolean } = {},
) => {
  const date = value ? new Date(String(value)) : null;

  if (date && endOfDay && !Number.isNaN(date.getTime())) {
    date.setUTCHours(23, 59, 59, 999);
  }

  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : value;
};

export const parseCreateOfferForm = (formData: FormData) =>
  createOfferSchema.safeParse({
    productId: formData.get('productId'),
    title: formData.get('title'),
    summary: formData.get('summary'),
    details: formData.get('details'),
    startsAt: dateTimeFromForm(formData.get('startsAt')),
    endsAt: dateTimeFromForm(formData.get('endsAt'), { endOfDay: true }),
  });

export const parseUpdateOfferForm = (formData: FormData) =>
  updateOfferSchema.safeParse({
    offerId: formData.get('offerId'),
    productId: formData.get('productId'),
    title: formData.get('title'),
    summary: formData.get('summary'),
    details: formData.get('details'),
    startsAt: dateTimeFromForm(formData.get('startsAt')),
    endsAt: dateTimeFromForm(formData.get('endsAt'), { endOfDay: true }),
  });

export const offerReferenceSchema = z.object({
  offerId: z.string().cuid(),
  action: z.enum(['PUBLISH', 'DRAFT', 'ARCHIVE']),
});
