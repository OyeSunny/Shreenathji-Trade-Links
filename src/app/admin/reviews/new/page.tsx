import { AdminReviewForm } from '@/components/reviews/admin-review-form';
import { createCustomerReview } from '@/features/reviews/server/review-actions';
import { db } from '@/lib/db';
import Link from 'next/link';

export default async function NewCustomerReviewPage() {
  const products = await db.product.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <>
      <Link className="btn btn-link mb-3 px-0" href="/admin/reviews">
        ← All customer reviews
      </Link>
      <section className="mb-4">
        <p className="mb-2 small text-secondary text-uppercase">
          Buyer feedback
        </p>
        <h1 className="display-6 fw-semibold mb-2">Add customer review</h1>
        <p className="mb-0 text-secondary">
          Save a draft while you collect confirmation, or publish a review that
          is ready for the public website.
        </p>
      </section>
      <AdminReviewForm action={createCustomerReview} products={products} />
    </>
  );
}
