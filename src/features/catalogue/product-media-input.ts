import { z } from 'zod';

const acceptedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

const mimeTypeByExtension: Record<string, string> = {
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const resolveImageMimeType = (file: File) => {
  if (acceptedImageTypes.has(file.type)) return file.type;

  const extension = file.name.split('.').at(-1)?.toLowerCase();
  return extension ? mimeTypeByExtension[extension] : undefined;
};

const addProductMediaSchema = z.object({
  productId: z.string().cuid(),
  caption: z
    .string()
    .trim()
    .min(2, 'Add a variant title with at least 2 characters.')
    .max(100, 'Keep the variant title under 100 characters.'),
  altText: z
    .string()
    .trim()
    .min(8, 'Describe the image in at least 8 characters.')
    .max(220, 'Keep the image description under 220 characters.'),
});

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

export const productMediaCaptionSchema = productMediaReferenceSchema.extend({
  caption: z
    .string()
    .trim()
    .min(2, 'Add a variant title with at least 2 characters.')
    .max(100, 'Keep the variant title under 100 characters.'),
});

const getTextField = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
};

export const parseAddProductMediaForm = (formData: FormData) => {
  const result = addProductMediaSchema.safeParse({
    productId: getTextField(formData, 'productId'),
    caption: getTextField(formData, 'caption'),
    altText: getTextField(formData, 'altText'),
  });
  const image = formData.get('image');
  const file = image instanceof File ? image : null;

  if (!result.success) return result;

  if (!file || file.size === 0) {
    return {
      success: false as const,
      error: {
        flatten: () => ({
          fieldErrors: { image: ['Choose an image to upload.'] },
        }),
      },
    };
  }

  const mimeType = resolveImageMimeType(file);

  if (!mimeType) {
    return {
      success: false as const,
      error: {
        flatten: () => ({
          fieldErrors: {
            image: ['Use a JPG, PNG, WebP, or AVIF image.'],
          },
        }),
      },
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      success: false as const,
      error: {
        flatten: () => ({
          fieldErrors: { image: ['Keep each image under 10 MB.'] },
        }),
      },
    };
  }

  return {
    success: true as const,
    data: { ...result.data, file, mimeType },
  };
};

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

export const parseProductMediaCaptionForm = (formData: FormData) =>
  productMediaCaptionSchema.safeParse({
    productId: getTextField(formData, 'productId'),
    mediaId: getTextField(formData, 'mediaId'),
    caption: getTextField(formData, 'caption'),
  });
