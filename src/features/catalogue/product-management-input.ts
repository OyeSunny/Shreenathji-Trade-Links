import { z } from 'zod';

const optionalText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength)
    .transform((value) => value || undefined);

const applicationsSchema = z
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

const optionalQuantity = z
  .string()
  .trim()
  .max(20)
  .refine(
    (value) => value === '' || /^\d{1,15}(?:\.\d{1,3})?$/.test(value),
    'Enter a quantity with up to three decimal places.',
  )
  .transform((value) => value || undefined);

const optionalPrice = z
  .string()
  .trim()
  .max(24)
  .refine(
    (value) => value === '' || /^\d{1,15}(?:\.\d{1,2})?$/.test(value),
    'Enter a price with up to two decimal places.',
  )
  .transform((value) => value || undefined);

const specificationSchema = z
  .array(
    z.object({
      label: z.string().trim().min(1).max(80),
      value: z.string().trim().min(1).max(200),
      unit: optionalText(30).optional(),
      malformed: z.boolean().optional(),
    }),
  )
  .superRefine((specifications, context) => {
    if (specifications.some((specification) => specification.malformed)) {
      context.addIssue({
        code: 'custom',
        message: 'Use “Label | Value | Unit” for each specification line.',
      });
    }
  });

const parseSpecifications = (value: string) => {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 20) {
    return {
      specifications: [{ label: 'Invalid', value: 'Invalid', malformed: true }],
      malformed: true,
    };
  }

  const specifications = lines.map((line) => {
    const [label, rawValue, ...unitParts] = line
      .split('|')
      .map((part) => part.trim());
    const unit = unitParts.join('|').trim();

    return {
      label: label ?? '',
      value: rawValue ?? '',
      unit: unit || undefined,
    };
  });

  const malformed = specifications.some(
    (specification) => !specification.label || !specification.value,
  );

  return {
    specifications: malformed
      ? [{ label: 'Invalid', value: 'Invalid', malformed: true }]
      : specifications,
    malformed,
  };
};

const updateProductSchema = z
  .object({
    productId: z.string().cuid(),
    categoryId: z.string().cuid(),
    productName: z.string().trim().min(2).max(140),
    summary: z.string().trim().min(10).max(500),
    description: optionalText(4000),
    grade: optionalText(100),
    form: optionalText(100),
    applications: applicationsSchema,
    packaging: optionalText(240),
    minimumOrderQty: optionalQuantity,
    orderUnit: optionalText(25),
    priceVisibility: z.enum(['ASK_FOR_PRICE', 'INDICATIVE_PRICE']),
    indicativePrice: optionalPrice,
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .refine((value) => value === '' || /^[A-Z]{3}$/.test(value), {
        message: 'Use a three-letter currency code, e.g. INR or USD.',
      })
      .transform((value) => value || undefined),
    availability: z.enum([
      'IN_STOCK',
      'LIMITED_STOCK',
      'AVAILABLE_ON_REQUEST',
      'OUT_OF_STOCK',
    ]),
    featured: z.boolean(),
    seoTitle: optionalText(160),
    seoDescription: optionalText(320),
    specifications: specificationSchema,
  })
  .superRefine((value, context) => {
    if (value.minimumOrderQty && !value.orderUnit) {
      context.addIssue({
        code: 'custom',
        message: 'Add a unit when entering a minimum order quantity.',
        path: ['orderUnit'],
      });
    }

    if (
      value.priceVisibility === 'INDICATIVE_PRICE' &&
      !value.indicativePrice
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Enter an indicative price or choose “Ask for price”.',
        path: ['indicativePrice'],
      });
    }

    if (value.indicativePrice && !value.currency) {
      context.addIssue({
        code: 'custom',
        message:
          'Add a three-letter currency code when entering an indicative price.',
        path: ['currency'],
      });
    }
  });

const categoryStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const updateCategorySchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().trim().min(2).max(100),
  introduction: optionalText(1000),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
  status: categoryStatusSchema,
});

const getTextField = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
};

export const parseUpdateProductForm = (formData: FormData) => {
  const specificationsResult = parseSpecifications(
    getTextField(formData, 'specifications'),
  );

  return updateProductSchema.safeParse({
    productId: getTextField(formData, 'productId'),
    categoryId: getTextField(formData, 'categoryId'),
    productName: getTextField(formData, 'productName'),
    summary: getTextField(formData, 'summary'),
    description: getTextField(formData, 'description'),
    grade: getTextField(formData, 'grade'),
    form: getTextField(formData, 'form'),
    applications: getTextField(formData, 'applications'),
    packaging: getTextField(formData, 'packaging'),
    minimumOrderQty: getTextField(formData, 'minimumOrderQty'),
    orderUnit: getTextField(formData, 'orderUnit'),
    priceVisibility: getTextField(formData, 'priceVisibility'),
    indicativePrice: getTextField(formData, 'indicativePrice'),
    currency: getTextField(formData, 'currency'),
    availability: getTextField(formData, 'availability'),
    featured: formData.get('featured') === 'on',
    seoTitle: getTextField(formData, 'seoTitle'),
    seoDescription: getTextField(formData, 'seoDescription'),
    specifications: specificationsResult.specifications,
  });
};

export const parseUpdateCategoryForm = (formData: FormData) =>
  updateCategorySchema.safeParse({
    categoryId: getTextField(formData, 'categoryId'),
    name: getTextField(formData, 'name'),
    introduction: getTextField(formData, 'introduction'),
    featured: formData.get('featured') === 'on',
    sortOrder: Number(getTextField(formData, 'sortOrder')),
    status: getTextField(formData, 'status'),
  });
