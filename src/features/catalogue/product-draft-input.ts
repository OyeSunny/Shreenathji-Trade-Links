import { z } from 'zod';

const optionalText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength)
    .transform((value) => value || undefined);

const productApplicationsSchema = z
  .string()
  .max(1200)
  .transform((value) =>
    Array.from(
      new Set(
        value
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ),
  )
  .superRefine((applications, context) => {
    if (applications.length > 12) {
      context.addIssue({
        code: 'custom',
        message: 'Enter up to 12 applications.',
      });
    }

    if (applications.some((application) => application.length > 100)) {
      context.addIssue({
        code: 'custom',
        message: 'Each application must be 100 characters or fewer.',
      });
    }
  });

const quantitySchema = z
  .string()
  .trim()
  .max(20)
  .refine(
    (value) => value === '' || /^\d{1,15}(?:\.\d{1,3})?$/.test(value),
    'Enter a positive quantity with up to three decimal places.',
  )
  .transform((value) => value || undefined);

const priceSchema = z
  .string()
  .trim()
  .max(24)
  .refine(
    (value) => value === '' || /^\d{1,15}(?:\.\d{1,2})?$/.test(value),
    'Enter a price with up to two decimal places.',
  )
  .transform((value) => value || undefined);

export const createProductDraftSchema = z
  .object({
    categoryName: z.string().trim().min(2).max(100),
    productName: z.string().trim().min(2).max(140),
    summary: z.string().trim().min(10).max(500),
    description: optionalText(4000),
    grade: optionalText(100),
    form: optionalText(100),
    applications: productApplicationsSchema,
    minimumOrderQty: quantitySchema,
    orderUnit: optionalText(25),
    priceVisibility: z.enum(['ASK_FOR_PRICE', 'INDICATIVE_PRICE']),
    indicativePrice: priceSchema,
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .refine((value) => value === '' || /^[A-Z]{3}$/.test(value), {
        message: 'Use a three-letter currency code, e.g. INR or USD.',
      })
      .transform((value) => value || undefined),
    priceUnit: optionalText(25),
    availability: z.enum([
      'IN_STOCK',
      'LIMITED_STOCK',
      'AVAILABLE_ON_REQUEST',
      'OUT_OF_STOCK',
    ]),
  })
  .superRefine((value, context) => {
    if (value.minimumOrderQty && !value.orderUnit) {
      context.addIssue({
        code: 'custom',
        message: 'Add a unit when entering a minimum order quantity.',
        path: ['orderUnit'],
      });
    }

    if (value.priceVisibility === 'INDICATIVE_PRICE') {
      if (!value.indicativePrice) {
        context.addIssue({
          code: 'custom',
          message: 'Enter the indicative price buyers should see.',
          path: ['indicativePrice'],
        });
      }

      if (!value.currency) {
        context.addIssue({
          code: 'custom',
          message: 'Add the currency for this price.',
          path: ['currency'],
        });
      }

      if (!value.priceUnit) {
        context.addIssue({
          code: 'custom',
          message: 'Add the unit buyers will use to understand this price.',
          path: ['priceUnit'],
        });
      }
    }
  });

export type CreateProductDraftInput = z.infer<typeof createProductDraftSchema>;

export const updateProductSchema = z
  .object({ productId: z.string().cuid() })
  .and(createProductDraftSchema);

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const slugifyCatalogueValue = (value: string, fallback: string) => {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
};

const getTextField = (formData: FormData, field: string) => {
  const value = formData.get(field);

  return typeof value === 'string' ? value : '';
};

export const parseCreateProductDraftForm = (formData: FormData) =>
  createProductDraftSchema.safeParse({
    categoryName: getTextField(formData, 'categoryName'),
    productName: getTextField(formData, 'productName'),
    summary: getTextField(formData, 'summary'),
    description: getTextField(formData, 'description'),
    grade: getTextField(formData, 'grade'),
    form: getTextField(formData, 'form'),
    applications: getTextField(formData, 'applications'),
    minimumOrderQty: getTextField(formData, 'minimumOrderQty'),
    orderUnit: getTextField(formData, 'orderUnit'),
    priceVisibility: getTextField(formData, 'priceVisibility'),
    indicativePrice: getTextField(formData, 'indicativePrice'),
    currency: getTextField(formData, 'currency'),
    priceUnit: getTextField(formData, 'priceUnit'),
    availability: getTextField(formData, 'availability'),
  });

export const parseUpdateProductForm = (formData: FormData) =>
  updateProductSchema.safeParse({
    productId: getTextField(formData, 'productId'),
    categoryName: getTextField(formData, 'categoryName'),
    productName: getTextField(formData, 'productName'),
    summary: getTextField(formData, 'summary'),
    description: getTextField(formData, 'description'),
    grade: getTextField(formData, 'grade'),
    form: getTextField(formData, 'form'),
    applications: getTextField(formData, 'applications'),
    minimumOrderQty: getTextField(formData, 'minimumOrderQty'),
    orderUnit: getTextField(formData, 'orderUnit'),
    priceVisibility: getTextField(formData, 'priceVisibility'),
    indicativePrice: getTextField(formData, 'indicativePrice'),
    currency: getTextField(formData, 'currency'),
    priceUnit: getTextField(formData, 'priceUnit'),
    availability: getTextField(formData, 'availability'),
  });
