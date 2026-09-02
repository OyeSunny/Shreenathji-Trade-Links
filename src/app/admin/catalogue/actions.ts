'use server';

import { requireOwnerPageSession } from '@/features/auth/server/session';
import {
  parseCreateProductDraftForm,
  slugifyCatalogueValue,
} from '@/features/catalogue/product-draft-input';
import {
  parseAddProductMediaForm,
  parseProductMediaReferenceForm,
  parseProductMediaSortOrderForm,
} from '@/features/catalogue/product-media-input';
import {
  MediaRightsStatus,
  MediaSource,
  Prisma,
  PublicationStatus,
} from '@/generated/prisma/client';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type ProductDraftFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
};

export type ProductMediaFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  status?: 'error' | 'success';
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

const getProductForMediaAction = async (productId: string) =>
  db.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  });

const revalidateProductMediaPaths = (product: { id: string; slug: string }) => {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${product.slug}`);
  revalidatePath('/admin/catalogue');
  revalidatePath(`/admin/catalogue/${product.id}/media`);
};

export const addProductMedia = async (
  _previousState: ProductMediaFormState,
  formData: FormData,
): Promise<ProductMediaFormState> => {
  await requireOwnerPageSession();

  const result = parseAddProductMediaForm(formData);

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: 'Review the image details and try again.',
      status: 'error',
    };
  }

  const product = await getProductForMediaAction(result.data.productId);

  if (!product) {
    return {
      message: 'This product is no longer available. Return to the catalogue.',
      status: 'error',
    };
  }

  const isProjectMedia = result.data.mediaOrigin === 'LOCAL_PROJECT_MEDIA';

  try {
    await db.$transaction(async (transaction) => {
      const highestSortOrder = await transaction.productMedia.aggregate({
        where: { productId: product.id },
        _max: { sortOrder: true },
      });
      const primaryImage = await transaction.productMedia.findFirst({
        where: { productId: product.id, isPrimary: true },
        select: { mediaId: true },
      });
      const media = await transaction.mediaAsset.create({
        data: {
          kind: 'IMAGE',
          sourceUrl: result.data.imageUrl,
          fileName: result.data.fileName,
          mimeType: 'image/*',
          altText: result.data.altText,
          source: isProjectMedia
            ? MediaSource.PROJECT_CREATED
            : MediaSource.SUPPLIER,
          sourceName: isProjectMedia
            ? 'Shreenathji Trade Links project media'
            : 'External URL supplied by owner — rights pending',
          sourceReferenceUrl: isProjectMedia ? null : result.data.imageUrl,
          rightsStatus: isProjectMedia
            ? MediaRightsStatus.APPROVED
            : MediaRightsStatus.PENDING_VERIFICATION,
          status: isProjectMedia
            ? PublicationStatus.PUBLISHED
            : PublicationStatus.DRAFT,
        },
      });

      await transaction.productMedia.create({
        data: {
          productId: product.id,
          mediaId: media.id,
          sortOrder: (highestSortOrder._max.sortOrder ?? -1) + 1,
          isPrimary: !primaryImage,
          altText: result.data.altText,
        },
      });
    });
  } catch {
    return {
      message: 'We could not save this image. Please try again.',
      status: 'error',
    };
  }

  revalidateProductMediaPaths(product);

  return {
    message: isProjectMedia
      ? 'Image added and ready for the public product carousel.'
      : 'Image added as a private draft until its rights are verified.',
    status: 'success',
  };
};

export const setPrimaryProductMedia = async (formData: FormData) => {
  await requireOwnerPageSession();

  const result = parseProductMediaReferenceForm(formData);
  if (!result.success) return;

  const product = await getProductForMediaAction(result.data.productId);
  if (!product) return;

  const association = await db.productMedia.findUnique({
    where: {
      productId_mediaId: {
        productId: product.id,
        mediaId: result.data.mediaId,
      },
    },
    select: { mediaId: true },
  });
  if (!association) return;

  await db.$transaction([
    db.productMedia.updateMany({
      where: { productId: product.id },
      data: { isPrimary: false },
    }),
    db.productMedia.update({
      where: {
        productId_mediaId: {
          productId: product.id,
          mediaId: association.mediaId,
        },
      },
      data: { isPrimary: true },
    }),
  ]);

  revalidateProductMediaPaths(product);
};

export const setProductMediaSortOrder = async (formData: FormData) => {
  await requireOwnerPageSession();

  const result = parseProductMediaSortOrderForm(formData);
  if (!result.success) return;

  const product = await getProductForMediaAction(result.data.productId);
  if (!product) return;

  const updated = await db.productMedia.updateMany({
    where: {
      productId: product.id,
      mediaId: result.data.mediaId,
    },
    data: { sortOrder: result.data.sortOrder },
  });
  if (updated.count === 0) return;

  revalidateProductMediaPaths(product);
};

export const removeProductMedia = async (formData: FormData) => {
  await requireOwnerPageSession();

  const result = parseProductMediaReferenceForm(formData);
  if (!result.success) return;

  const product = await getProductForMediaAction(result.data.productId);
  if (!product) return;

  const removed = await db.$transaction(async (transaction) => {
    const association = await transaction.productMedia.findUnique({
      where: {
        productId_mediaId: {
          productId: product.id,
          mediaId: result.data.mediaId,
        },
      },
      select: { mediaId: true },
    });
    if (!association) return false;

    await transaction.productMedia.delete({
      where: {
        productId_mediaId: {
          productId: product.id,
          mediaId: association.mediaId,
        },
      },
    });

    const remainingReferences = await transaction.productMedia.count({
      where: { mediaId: association.mediaId },
    });
    if (remainingReferences === 0) {
      await transaction.mediaAsset.delete({
        where: { id: association.mediaId },
      });
    }

    return true;
  });

  if (removed) revalidateProductMediaPaths(product);
};
