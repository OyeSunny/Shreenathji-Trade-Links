import { PublicationStatus } from '@/generated/prisma/client';
import { db } from '@/lib/db';
import 'server-only';

/**
 * This is the only review query intended for public pages. Drafts are never
 * returned here, even when an admin guesses a review identifier in the URL.
 */
export async function getPublishedCustomerReviews() {
  return db.customerReview.findMany({
    where: { status: PublicationStatus.PUBLISHED },
    orderBy: [
      { featured: 'desc' },
      { sortOrder: 'asc' },
      { reviewedOn: 'desc' },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      reviewerName: true,
      companyName: true,
      location: true,
      productName: true,
      rating: true,
      comment: true,
      reviewedOn: true,
      featured: true,
    },
  });
}
