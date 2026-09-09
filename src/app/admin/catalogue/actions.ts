'use server';

import { requireOwnerPageSession } from '@/features/auth/server/session';
import {
  parseCreateProductDraftForm,
  parseUpdateProductForm,
  slugifyCatalogueValue,
} from '@/features/catalogue/product-draft-input';
import {
  parseAddProductMediaForm,
  parseProductMediaReferenceForm,
  parseProductMediaSortOrderForm,
} from '@/features/catalogue/product-media-input';
import {
  InvalidUploadedImageError,
  removeLocalUpload,
  storeLocalProductImage,
} from '@/features/catalogue/server/local-image-upload';
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
  priceVisibility?: 'ASK_FOR_PRICE' | 'INDICATIVE_PRICE';
  status?: 'error' | 'success';
};

const getSubmittedPriceVisibility = (formData: FormData) =>
  formData.get('priceVisibility') === 'INDICATIVE_PRICE'
    ? 'INDICATIVE_PRICE'
    : 'ASK_FOR_PRICE';

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
      priceVisibility: getSubmittedPriceVisibility(formData),
      status: 'error',
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
          priceVisibility: input.priceVisibility,
          indicativePrice:
            input.priceVisibility === 'INDICATIVE_PRICE'
              ? input.indicativePrice
              : null,
          currency:
            input.priceVisibility === 'INDICATIVE_PRICE'
              ? input.currency
              : null,
          priceUnit:
            input.priceVisibility === 'INDICATIVE_PRICE'
              ? input.priceUnit
              : null,
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

export const updateProduct = async (
  _previousState: ProductDraftFormState,
  formData: FormData,
): Promise<ProductDraftFormState> => {
  await requireOwnerPageSession();

  const result = parseUpdateProductForm(formData);
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: 'Review the highlighted fields and try again.',
      priceVisibility: getSubmittedPriceVisibility(formData),
      status: 'error',
    };
  }

  const existing = await db.product.findUnique({
    where: { id: result.data.productId },
    select: { id: true, slug: true, status: true },
  });
  if (!existing) {
    return { message: 'This product is no longer available.', status: 'error' };
  }

  const categorySlug = slugifyCatalogueValue(
    result.data.categoryName,
    'category',
  );

  try {
    await db.$transaction(async (transaction) => {
      const category = await transaction.productCategory.upsert({
        where: { slug: categorySlug },
        create: {
          name: result.data.categoryName,
          slug: categorySlug,
          status:
            existing.status === 'PUBLISHED'
              ? PublicationStatus.PUBLISHED
              : PublicationStatus.DRAFT,
        },
        update: { name: result.data.categoryName },
      });

      await transaction.product.update({
        where: { id: existing.id },
        data: {
          categoryId: category.id,
          name: result.data.productName,
          summary: result.data.summary,
          description: result.data.description,
          grade: result.data.grade,
          form: result.data.form,
          applications: result.data.applications,
          minimumOrderQty: result.data.minimumOrderQty,
          orderUnit: result.data.orderUnit,
          priceVisibility: result.data.priceVisibility,
          indicativePrice:
            result.data.priceVisibility === 'INDICATIVE_PRICE'
              ? result.data.indicativePrice
              : null,
          currency:
            result.data.priceVisibility === 'INDICATIVE_PRICE'
              ? result.data.currency
              : null,
          priceUnit:
            result.data.priceVisibility === 'INDICATIVE_PRICE'
              ? result.data.priceUnit
              : null,
          availability: result.data.availability,
        },
      });
    });
  } catch {
    return {
      message: 'We could not update this product. Please try again.',
      priceVisibility: getSubmittedPriceVisibility(formData),
      status: 'error',
    };
  }

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${existing.slug}`);
  revalidatePath('/admin/catalogue');
  revalidatePath(`/admin/catalogue/${existing.id}/edit`);
  return {
    message: 'Product details have been saved.',
    priceVisibility: result.data.priceVisibility,
    status: 'success',
  };
};

const publicationChangeSchema = z.object({
  productId: z.string().cuid(),
  action: z.enum(['PUBLISH', 'DRAFT']),
});

const productReferenceSchema = z.object({ productId: z.string().cuid() });

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

export const archiveProduct = async (formData: FormData) => {
  await requireOwnerPageSession();
  const result = productReferenceSchema.safeParse({
    productId: formData.get('productId'),
  });
  if (!result.success) return;

  const product = await db.product.findUnique({
    where: { id: result.data.productId },
    select: { id: true, slug: true },
  });
  if (!product) return;

  await db.product.update({
    where: { id: product.id },
    data: { status: PublicationStatus.ARCHIVED, publishedAt: null },
  });
  revalidateProductMediaPaths(product);
};

export const restoreProduct = async (formData: FormData) => {
  await requireOwnerPageSession();
  const result = productReferenceSchema.safeParse({
    productId: formData.get('productId'),
  });
  if (!result.success) return;

  const product = await db.product.findUnique({
    where: { id: result.data.productId },
    select: { id: true, slug: true },
  });
  if (!product) return;

  await db.product.update({
    where: { id: product.id },
    data: { status: PublicationStatus.DRAFT, publishedAt: null },
  });
  revalidateProductMediaPaths(product);
};

export const permanentlyDeleteUnusedDraft = async (formData: FormData) => {
  await requireOwnerPageSession();
  const result = productReferenceSchema.safeParse({
    productId: formData.get('productId'),
  });
  if (!result.success) return;

  const product = await db.product.findUnique({
    where: { id: result.data.productId },
    include: {
      media: { include: { media: { select: { storageKey: true } } } },
      _count: {
        select: { customerReviews: true, enquiryItems: true, offers: true },
      },
    },
  });
  if (
    !product ||
    product.status !== PublicationStatus.DRAFT ||
    product._count.enquiryItems > 0 ||
    product._count.customerReviews > 0 ||
    product._count.offers > 0
  ) {
    return;
  }

  const orphanedStorageKeys = await db.$transaction(async (transaction) => {
    await transaction.product.delete({ where: { id: product.id } });
    const removable = [] as string[];

    for (const media of product.media) {
      const references = await transaction.productMedia.count({
        where: { mediaId: media.mediaId },
      });
      if (references === 0) {
        await transaction.mediaAsset.delete({ where: { id: media.mediaId } });
        if (media.media.storageKey) removable.push(media.media.storageKey);
      }
    }

    return removable;
  });

  await Promise.all(orphanedStorageKeys.map((key) => removeLocalUpload(key)));
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin/catalogue');
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

  let upload: Awaited<ReturnType<typeof storeLocalProductImage>>;

  try {
    upload = await storeLocalProductImage(result.data.file);
  } catch (error) {
    return {
      message:
        error instanceof InvalidUploadedImageError
          ? 'That file does not match a supported image format.'
          : 'We could not store this image. Please try again.',
      status: 'error',
    };
  }

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
          storageKey: upload.storageKey,
          sourceUrl: upload.publicUrl,
          fileName: upload.fileName,
          mimeType: result.data.file.type,
          altText: result.data.altText,
          source: MediaSource.PROJECT_CREATED,
          sourceName: 'Owner upload',
          sourceReferenceUrl: null,
          rightsStatus: MediaRightsStatus.APPROVED,
          status: PublicationStatus.PUBLISHED,
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
    await removeLocalUpload(upload.storageKey);
    return {
      message: 'We could not save this image. Please try again.',
      status: 'error',
    };
  }

  revalidateProductMediaPaths(product);

  return {
    message: 'Image uploaded and ready for the public product carousel.',
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
      select: { mediaId: true, media: { select: { storageKey: true } } },
    });
    if (!association) return null;

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

    return association.media.storageKey;
  });

  if (removed !== null) {
    await removeLocalUpload(removed);
    revalidateProductMediaPaths(product);
  }
};
