import { z } from 'zod';

const optionalText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength)
    .transform((value) => value || undefined);

const optionalProductId = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .pipe(z.string().cuid().optional());

const optionalDate = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .pipe(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid review date.')
      .transform((value, context) => {
        const date = new Date(`${value}T12:00:00.000Z`);

        if (Number.isNaN(date.getTime())) {
          context.addIssue({
            code: 'custom',
            message: 'Use a valid review date.',
          });
          return z.NEVER;
        }

        return date;
      })
      .optional(),
  );

const reviewFields = z.object({
  reviewerName: z
    .string()
    .trim()
    .min(2, 'Enter the reviewer name.')
    .max(120, 'Keep the reviewer name under 120 characters.'),
  companyName: optionalText(160),
  location: optionalText(120),
  productId: optionalProductId,
  productName: optionalText(140),
  rating: z.coerce
    .number()
    .int('Choose a whole-star rating.')
    .min(1, 'Choose between one and five stars.')
    .max(5, 'Choose between one and five stars.'),
  comment: z
    .string()
    .trim()
    .min(20, 'Add at least 20 characters of approved feedback.')
    .max(1_500, 'Keep the review under 1,500 characters.'),
  reviewedOn: optionalDate,
  status: z.enum(['DRAFT', 'PUBLISHED']),
  featured: z.boolean(),
  sortOrder: z.coerce
    .number()
    .int('Use a whole number.')
    .min(0, 'Use zero or a positive number.')
    .max(9_999, 'Use a number below 10,000.'),
});

export const createCustomerReviewSchema = reviewFields;
export const updateCustomerReviewSchema = reviewFields.extend({
  reviewId: z.string().cuid(),
});

export const reviewReferenceSchema = z.object({
  reviewId: z.string().cuid(),
});

export const reviewPublicationSchema = reviewReferenceSchema.extend({
  action: z.enum(['PUBLISH', 'DRAFT']),
});

export type CustomerReviewInput = z.infer<typeof createCustomerReviewSchema>;

const getTextField = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
};

const getCheckboxField = (formData: FormData, field: string) =>
  formData.get(field) === 'on';

const parseFields = (formData: FormData) => ({
  reviewerName: getTextField(formData, 'reviewerName'),
  companyName: getTextField(formData, 'companyName'),
  location: getTextField(formData, 'location'),
  productId: getTextField(formData, 'productId'),
  productName: getTextField(formData, 'productName'),
  rating: getTextField(formData, 'rating'),
  comment: getTextField(formData, 'comment'),
  reviewedOn: getTextField(formData, 'reviewedOn'),
  status: getTextField(formData, 'status'),
  featured: getCheckboxField(formData, 'featured'),
  sortOrder: getTextField(formData, 'sortOrder'),
});

export const parseCreateCustomerReviewForm = (formData: FormData) =>
  createCustomerReviewSchema.safeParse(parseFields(formData));

export const parseUpdateCustomerReviewForm = (formData: FormData) =>
  updateCustomerReviewSchema.safeParse({
    ...parseFields(formData),
    reviewId: getTextField(formData, 'reviewId'),
  });

export const parseReviewReferenceForm = (formData: FormData) =>
  reviewReferenceSchema.safeParse({
    reviewId: getTextField(formData, 'reviewId'),
  });

export const parseReviewPublicationForm = (formData: FormData) =>
  reviewPublicationSchema.safeParse({
    reviewId: getTextField(formData, 'reviewId'),
    action: getTextField(formData, 'action'),
  });
