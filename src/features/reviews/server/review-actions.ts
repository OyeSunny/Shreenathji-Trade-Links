'use server';

import { requireOwnerPageSession } from '@/features/auth/server/session';
import {
  parseCreateCustomerReviewForm,
  parseReviewPublicationForm,
  parseReviewReferenceForm,
  parseUpdateCustomerReviewForm,
  type CustomerReviewInput,
} from '@/features/reviews/review-input';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type CustomerReviewFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
};

const revalidateReviewPaths = () => {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin');
  revalidatePath('/admin/reviews');
};

const resolveProduct = async (input: CustomerReviewInput) => {
  if (!input.productId) {
    return { productId: null, productName: input.productName ?? null };
  }

  const product = await db.product.findUnique({
    where: { id: input.productId },
    select: { id: true, name: true },
  });

  if (!product) return null;

  return { productId: product.id, productName: product.name };
};

const reviewData = (
  input: CustomerReviewInput,
  product: { productId: string | null; productName: string | null },
) => ({
  reviewerName: input.reviewerName,
  companyName: input.companyName ?? null,
  location: input.location ?? null,
  productId: product.productId,
  productName: product.productName,
  rating: input.rating,
  comment: input.comment,
  reviewedOn: input.reviewedOn ?? null,
  status: input.status,
  featured: input.featured,
  sortOrder: input.sortOrder,
  publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
});

export const createCustomerReview = async (
  _previousState: CustomerReviewFormState,
  formData: FormData,
): Promise<CustomerReviewFormState> => {
  await requireOwnerPageSession();

  const result = parseCreateCustomerReviewForm(formData);
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: 'Review the highlighted fields and try again.',
    };
  }

  const product = await resolveProduct(result.data);
  if (!product) {
    return {
      fieldErrors: { productId: ['Choose a product that still exists.'] },
      message: 'Review the highlighted fields and try again.',
    };
  }

  await db.customerReview.create({ data: reviewData(result.data, product) });
  revalidateReviewPaths();
  redirect('/admin/reviews?created=1');
};

export const updateCustomerReview = async (
  _previousState: CustomerReviewFormState,
  formData: FormData,
): Promise<CustomerReviewFormState> => {
  await requireOwnerPageSession();

  const result = parseUpdateCustomerReviewForm(formData);
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
      message: 'Review the highlighted fields and try again.',
    };
  }

  const product = await resolveProduct(result.data);
  if (!product) {
    return {
      fieldErrors: { productId: ['Choose a product that still exists.'] },
      message: 'Review the highlighted fields and try again.',
    };
  }

  const existing = await db.customerReview.findUnique({
    where: { id: result.data.reviewId },
    select: { id: true },
  });
  if (!existing) {
    return { message: 'This review no longer exists. Return to all reviews.' };
  }

  await db.customerReview.update({
    where: { id: existing.id },
    data: reviewData(result.data, product),
  });
  revalidateReviewPaths();
  redirect('/admin/reviews?updated=1');
};

export const changeCustomerReviewPublication = async (formData: FormData) => {
  await requireOwnerPageSession();

  const result = parseReviewPublicationForm(formData);
  if (!result.success) return;

  const isPublishing = result.data.action === 'PUBLISH';
  const updated = await db.customerReview.updateMany({
    where: { id: result.data.reviewId },
    data: {
      status: isPublishing ? 'PUBLISHED' : 'DRAFT',
      publishedAt: isPublishing ? new Date() : null,
    },
  });
  if (updated.count) revalidateReviewPaths();
};

export const deleteCustomerReview = async (formData: FormData) => {
  await requireOwnerPageSession();

  const result = parseReviewReferenceForm(formData);
  if (!result.success) return;

  const deleted = await db.customerReview.deleteMany({
    where: { id: result.data.reviewId },
  });
  if (deleted.count) revalidateReviewPaths();
};
