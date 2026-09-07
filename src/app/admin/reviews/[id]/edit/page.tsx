import { AdminReviewForm } from '@/components/reviews/admin-review-form';
import { updateCustomerReview } from '@/features/reviews/server/review-actions';
import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditCustomerReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [review, products] = await Promise.all([
    db.customerReview.findUnique({ where: { id } }),
    db.product.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!review) notFound();

  return (
    <>
      <Link className="btn btn-link mb-3 px-0" href="/admin/reviews">
        ← All customer reviews
      </Link>
      <section className="mb-4">
        <p className="mb-2 small text-secondary text-uppercase">
          Buyer feedback
        </p>
        <h1 className="display-6 fw-semibold mb-2">Edit customer review</h1>
        <p className="mb-0 text-secondary">
          Changes remain private until this review is set to published.
        </p>
      </section>
      <AdminReviewForm
        action={updateCustomerReview}
        products={products}
        review={{
          ...review,
          reviewedOn: review.reviewedOn?.toISOString().slice(0, 10) ?? null,
        }}
      />
    </>
  );
}
