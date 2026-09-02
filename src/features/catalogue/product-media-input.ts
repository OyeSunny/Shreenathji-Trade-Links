import { z } from 'zod';

export const productMediaOriginSchema = z.enum([
  'LOCAL_PROJECT_MEDIA',
  'EXTERNAL_HTTPS',
]);

const imageUrlSchema = z
  .string()
  .trim()
  .min(1, 'Add an image URL.')
  .max(2_048, 'Image URLs must be 2,048 characters or fewer.')
  .superRefine((value, context) => {
    if (value.startsWith('/media/') && !value.startsWith('//')) return;

    try {
      const url = new URL(value);

      if (
        url.protocol === 'https:' &&
        url.hostname.length > 0 &&
        !url.username &&
        !url.password
      ) {
        return;
      }
    } catch {
      // The validation message below covers malformed absolute URLs.
    }

    context.addIssue({
      code: 'custom',
      message:
        'Use a public HTTPS URL or a project path beginning with /media/.',
    });
  });

const fileNameFromUrl = (imageUrl: string) => {
  const path = imageUrl.startsWith('/') ? imageUrl : new URL(imageUrl).pathname;
  const possibleFileName = decodeURIComponent(path.split('/').pop() ?? '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .slice(0, 180);

  return possibleFileName || 'product-image';
};

export const addProductMediaSchema = z
  .object({
    productId: z.string().cuid(),
    imageUrl: imageUrlSchema,
    altText: z
      .string()
      .trim()
      .min(8, 'Describe the image in at least 8 characters.')
      .max(220, 'Keep the image description under 220 characters.'),
  })
  .transform((value) => ({
    ...value,
    fileName: fileNameFromUrl(value.imageUrl),
    mediaOrigin: value.imageUrl.startsWith('/media/')
      ? ('LOCAL_PROJECT_MEDIA' as const)
      : ('EXTERNAL_HTTPS' as const),
  }));

export const productMediaReferenceSchema = z.object({
  mediaId: z.string().cuid(),
  productId: z.string().cuid(),
});

export const productMediaSortOrderSchema = productMediaReferenceSchema.extend({
  sortOrder: z.coerce
    .number()
    .int('Use a whole number.')
    .min(0, 'Use zero or a positive number.')
    .max(9_999, 'Use a number below 10,000.'),
});

const getTextField = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
};

export const parseAddProductMediaForm = (formData: FormData) =>
  addProductMediaSchema.safeParse({
    productId: getTextField(formData, 'productId'),
    imageUrl: getTextField(formData, 'imageUrl'),
    altText: getTextField(formData, 'altText'),
  });

export const parseProductMediaReferenceForm = (formData: FormData) =>
  productMediaReferenceSchema.safeParse({
    productId: getTextField(formData, 'productId'),
    mediaId: getTextField(formData, 'mediaId'),
  });

export const parseProductMediaSortOrderForm = (formData: FormData) =>
  productMediaSortOrderSchema.safeParse({
    productId: getTextField(formData, 'productId'),
    mediaId: getTextField(formData, 'mediaId'),
    sortOrder: getTextField(formData, 'sortOrder'),
  });
