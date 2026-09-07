import {
  changeCustomerReviewPublication,
  deleteCustomerReview,
} from '@/features/reviews/server/review-actions';
import { db } from '@/lib/db';
import Link from 'next/link';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardHeader from 'react-bootstrap/CardHeader';
import Table from 'react-bootstrap/Table';

const reviewStatusVariant = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'secondary',
} as const;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string }>;
}) {
  const [reviews, parameters] = await Promise.all([
    db.customerReview.findMany({
      orderBy: [
        { status: 'asc' },
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { updatedAt: 'desc' },
      ],
    }),
    searchParams,
  ]);

  return (
    <>
      <section className="align-items-md-end d-flex flex-column flex-md-row gap-3 justify-content-between mb-4">
        <div>
          <p className="mb-2 small text-secondary text-uppercase">
            Buyer feedback
          </p>
          <h1 className="display-6 fw-semibold mb-2">Customer reviews</h1>
          <p className="mb-0 text-secondary">
            Keep unapproved examples private. Publish only feedback the customer
            has approved for use on the website.
          </p>
        </div>
        <Link className="btn btn-primary" href="/admin/reviews/new">
          Add customer review
        </Link>
      </section>

      {parameters.created === '1' ? (
        <Alert variant="success">Customer review created.</Alert>
      ) : null}
      {parameters.updated === '1' ? (
        <Alert variant="success">Customer review updated.</Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardHeader className="bg-white border-bottom-0 d-flex justify-content-between py-3">
          <span className="fw-semibold">All reviews</span>
          <span className="small text-secondary">{reviews.length} total</span>
        </CardHeader>
        <CardBody className="p-0">
          {reviews.length === 0 ? (
            <div className="p-4 p-md-5 text-center">
              <h2 className="h5">No customer reviews yet</h2>
              <p className="mb-3 text-secondary">
                Add an approved review as a draft first, then publish it when
                the client confirms the final wording.
              </p>
              <Link
                className="btn btn-outline-primary"
                href="/admin/reviews/new"
              >
                Add first review
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="align-middle mb-0" hover>
                <thead>
                  <tr>
                    <th scope="col">Review</th>
                    <th scope="col">Rating</th>
                    <th scope="col">Visibility</th>
                    <th scope="col">Order</th>
                    <th scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <span className="d-block fw-semibold">
                          {review.reviewerName}
                        </span>
                        {review.companyName ? (
                          <span className="d-block small text-secondary">
                            {review.companyName}
                          </span>
                        ) : null}
                        <span
                          className="d-block mt-1 small"
                          style={{ maxWidth: '34rem' }}
                        >
                          {review.comment}
                        </span>
                      </td>
                      <td
                        className="text-nowrap"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </td>
                      <td>
                        <Badge
                          bg={reviewStatusVariant[review.status]}
                          text={review.status === 'DRAFT' ? 'dark' : undefined}
                        >
                          {review.status === 'DRAFT'
                            ? 'Draft'
                            : review.status === 'PUBLISHED'
                              ? 'Published'
                              : 'Archived'}
                        </Badge>
                        {review.featured ? (
                          <span className="d-block small text-secondary mt-1">
                            Featured
                          </span>
                        ) : null}
                      </td>
                      <td>{review.sortOrder}</td>
                      <td>
                        <div className="align-items-start d-flex flex-column gap-2">
                          <Link
                            className="btn btn-outline-primary btn-sm"
                            href={`/admin/reviews/${review.id}/edit`}
                          >
                            Edit
                          </Link>
                          <form action={changeCustomerReviewPublication}>
                            <input
                              name="reviewId"
                              type="hidden"
                              value={review.id}
                            />
                            <input
                              name="action"
                              type="hidden"
                              value={
                                review.status === 'PUBLISHED'
                                  ? 'DRAFT'
                                  : 'PUBLISH'
                              }
                            />
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              type="submit"
                            >
                              {review.status === 'PUBLISHED'
                                ? 'Move to draft'
                                : 'Publish'}
                            </button>
                          </form>
                          <form action={deleteCustomerReview}>
                            <input
                              name="reviewId"
                              type="hidden"
                              value={review.id}
                            />
                            <button
                              className="btn btn-outline-danger btn-sm"
                              type="submit"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
