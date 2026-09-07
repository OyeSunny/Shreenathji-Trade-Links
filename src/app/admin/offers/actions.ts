'use server';

import { requireOwnerPageSession } from '@/features/auth/server/session';
import { slugifyCatalogueValue } from '@/features/catalogue/product-draft-input';
import {
  offerReferenceSchema,
  parseCreateOfferForm,
  parseUpdateOfferForm,
} from '@/features/offers/offer-input';
import { PublicationStatus } from '@/generated/prisma/client';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type OfferFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
};

const revalidateOfferPaths = (slug?: string) => {
  revalidatePath('/');
  revalidatePath('/offers');
  revalidatePath('/products');
  revalidatePath('/request-a-quote');
  revalidatePath('/admin/offers');

  if (slug) revalidatePath(`/offers/${slug}`);
};

export const createOffer = async (
  _previousState: OfferFormState,
  formData: FormData,
): Promise<OfferFormState> => {
  await requireOwnerPageSession();

  const result = parseCreateOfferForm(formData);

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: 'Review the highlighted fields and try again.',
    };
  }

  const product = await db.product.findUnique({
    where: { id: result.data.productId },
    select: { id: true, name: true },
  });

  if (!product) {
    return {
      fieldErrors: { productId: ['Choose a product that is still available.'] },
      message: 'The selected product is no longer available.',
    };
  }

  const baseSlug = slugifyCatalogueValue(result.data.title, 'offer');
  let slug = baseSlug;
  let suffix = 2;

  while (await db.offer.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;

    if (suffix > 100) {
      return { message: 'Choose a more specific offer title and try again.' };
    }
  }

  const offer = await db.offer.create({
    data: {
      productId: product.id,
      title: result.data.title,
      slug,
      summary: result.data.summary,
      details: result.data.details,
      startsAt: result.data.startsAt ? new Date(result.data.startsAt) : null,
      endsAt: result.data.endsAt ? new Date(result.data.endsAt) : null,
      status: PublicationStatus.DRAFT,
    },
    select: { slug: true },
  });

  revalidateOfferPaths(offer.slug);
  redirect('/admin/offers?created=1');
};

export const updateOffer = async (
  _previousState: OfferFormState,
  formData: FormData,
): Promise<OfferFormState> => {
  await requireOwnerPageSession();
  const result = parseUpdateOfferForm(formData);
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: 'Review the highlighted fields and try again.',
    };
  }

  const offer = await db.offer.findUnique({
    where: { id: result.data.offerId },
    select: { id: true, slug: true },
  });
  const product = await db.product.findUnique({
    where: { id: result.data.productId },
    select: { id: true },
  });
  if (!offer || !product)
    return { message: 'The offer or selected product no longer exists.' };

  try {
    await db.offer.update({
      where: { id: offer.id },
      data: {
        productId: product.id,
        title: result.data.title,
        summary: result.data.summary,
        details: result.data.details,
        startsAt: result.data.startsAt ? new Date(result.data.startsAt) : null,
        endsAt: result.data.endsAt ? new Date(result.data.endsAt) : null,
      },
    });
  } catch {
    return { message: 'We could not update this offer. Please try again.' };
  }

  revalidateOfferPaths(offer.slug);
  return { message: 'Offer details have been saved.' };
};

export const changeOfferPublication = async (formData: FormData) => {
  await requireOwnerPageSession();

  const result = offerReferenceSchema.safeParse({
    offerId: formData.get('offerId'),
    action: formData.get('action'),
  });
  if (!result.success) return;

  const offer = await db.offer.findUnique({
    where: { id: result.data.offerId },
    select: { slug: true, product: { select: { status: true } } },
  });
  if (!offer) return;

  if (
    result.data.action === 'PUBLISH' &&
    offer.product.status !== PublicationStatus.PUBLISHED
  ) {
    return;
  }

  const isPublishing = result.data.action === 'PUBLISH';
  await db.offer.update({
    where: { id: result.data.offerId },
    data: {
      status:
        result.data.action === 'ARCHIVE'
          ? PublicationStatus.ARCHIVED
          : isPublishing
            ? PublicationStatus.PUBLISHED
            : PublicationStatus.DRAFT,
      publishedAt: isPublishing ? new Date() : null,
    },
  });

  revalidateOfferPaths(offer.slug);
};
