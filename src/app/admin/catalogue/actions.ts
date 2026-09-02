'use server';

import { requireOwnerPageSession } from '@/features/auth/server/session';
import {
  parseCreateProductDraftForm,
  slugifyCatalogueValue,
} from '@/features/catalogue/product-draft-input';
import { Prisma } from '@/generated/prisma/client';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type ProductDraftFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
};

export const createProductDraft = async (
  _previousState: ProductDraftFormState,
  formData: FormData,
): Promise<ProductDraftFormState> => {
  await requireOwnerPageSession();

  const result = parseCreateProductDraftForm(formData);

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: 'Review the highlighted fields and try again.',
    };
  }

  const input = result.data;
  const categorySlug = slugifyCatalogueValue(input.categoryName, 'category');
  const productSlugBase = slugifyCatalogueValue(input.productName, 'product');

  try {
    await db.$transaction(async (transaction) => {
      const category = await transaction.productCategory.upsert({
        where: { slug: categorySlug },
        create: {
          name: input.categoryName,
          slug: categorySlug,
          status: 'DRAFT',
        },
        update: {},
      });

      let productSlug = productSlugBase;
      let suffix = 2;

      while (
        await transaction.product.findUnique({
          where: { slug: productSlug },
          select: { id: true },
        })
      ) {
        productSlug = `${productSlugBase}-${suffix}`;
        suffix += 1;

        if (suffix > 100) {
          throw new Error('PRODUCT_SLUG_SPACE_EXHAUSTED');
        }
      }

      await transaction.product.create({
        data: {
          categoryId: category.id,
          name: input.productName,
          slug: productSlug,
          summary: input.summary,
          description: input.description,
          grade: input.grade,
          form: input.form,
          applications: input.applications,
          minimumOrderQty: input.minimumOrderQty,
          orderUnit: input.orderUnit,
          availability: input.availability,
          status: 'DRAFT',
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        message:
          'A product with a similar name was saved at the same time. Please try again.',
      };
    }

    return { message: 'We could not save this draft. Please try again.' };
  }

  revalidatePath('/admin/catalogue');
  redirect('/admin/catalogue?created=1');
};

const publicationChangeSchema = z.object({
  productId: z.string().cuid(),
  action: z.enum(['PUBLISH', 'DRAFT']),
});

export const changeProductPublication = async (formData: FormData) => {
  await requireOwnerPageSession();

  const result = publicationChangeSchema.safeParse({
    productId: formData.get('productId'),
    action: formData.get('action'),
  });

  if (!result.success) return;

  const product = await db.product.findUnique({
    where: { id: result.data.productId },
    select: { categoryId: true },
  });

  if (!product) return;

  const isPublishing = result.data.action === 'PUBLISH';

  await db.$transaction([
    db.product.update({
      where: { id: result.data.productId },
      data: {
        status: isPublishing ? 'PUBLISHED' : 'DRAFT',
        publishedAt: isPublishing ? new Date() : null,
      },
    }),
    ...(isPublishing
      ? [
          db.productCategory.update({
            where: { id: product.categoryId },
            data: { status: 'PUBLISHED' },
          }),
        ]
      : []),
  ]);

  revalidatePath('/admin/catalogue');
  revalidatePath('/products');
};
