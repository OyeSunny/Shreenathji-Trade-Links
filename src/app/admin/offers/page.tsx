import { changeOfferPublication } from '@/app/admin/offers/actions';
import { db } from '@/lib/db';
import Link from 'next/link';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardHeader from 'react-bootstrap/CardHeader';
import Table from 'react-bootstrap/Table';

const statusVariant = {
  ARCHIVED: 'secondary',
  DRAFT: 'warning',
  PUBLISHED: 'success',
} as const;

const statusLabel = (status: keyof typeof statusVariant) =>
  status.charAt(0) + status.slice(1).toLowerCase();

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const [offers, parameters] = await Promise.all([
    db.offer.findMany({
      include: { product: { select: { name: true, status: true } } },
      orderBy: [{ updatedAt: 'desc' }, { title: 'asc' }],
    }),
    searchParams,
  ]);

  return (
    <>
      <section className="align-items-md-end d-flex flex-column flex-md-row gap-3 justify-content-between mb-4">
        <div>
          <p className="mb-2 small text-secondary text-uppercase">
            Buyer opportunities
          </p>
          <h1 className="display-6 fw-semibold mb-2">Offers</h1>
          <p className="mb-0 text-secondary">
            Publish time-bound or limited-stock offers that lead buyers into a
            direct quote request.
          </p>
        </div>
        <Link className="btn btn-primary" href="/admin/offers/new">
          Add draft offer
        </Link>
      </section>

      {parameters.created === '1' ? (
        <Alert variant="success">
          Draft offer saved. It is not public until you publish it.
        </Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardHeader className="bg-white border-bottom-0 d-flex justify-content-between py-3">
          <span className="fw-semibold">All offers</span>
          <span className="small text-secondary">{offers.length} total</span>
        </CardHeader>
        <CardBody className="p-0">
          {offers.length === 0 ? (
            <div className="p-4 p-md-5 text-center">
              <h2 className="h5">No offers are ready yet</h2>
              <p className="mb-3 text-secondary">
                Add a draft for limited stock, a seasonal opportunity, or a
                material you want buyers to enquire about.
              </p>
              <Link
                className="btn btn-outline-primary"
                href="/admin/offers/new"
              >
                Create first offer
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="align-middle mb-0" hover>
                <thead>
                  <tr>
                    <th scope="col">Offer</th>
                    <th scope="col">Product</th>
                    <th scope="col">Schedule</th>
                    <th scope="col">Status</th>
                    <th scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => {
                    const canPublish = offer.product.status === 'PUBLISHED';
                    const action =
                      offer.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISH';

                    return (
                      <tr key={offer.id}>
                        <td>
                          <span className="d-block fw-semibold">
                            {offer.title}
                          </span>
                          <span className="d-block small text-secondary">
                            {offer.summary}
                          </span>
                        </td>
                        <td>
                          {offer.product.name}
                          {!canPublish ? (
                            <span className="d-block small text-warning-emphasis">
                              Product is not public
                            </span>
                          ) : null}
                        </td>
                        <td className="small text-secondary text-nowrap">
                          {offer.startsAt
                            ? new Intl.DateTimeFormat('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }).format(offer.startsAt)
                            : 'Starts now'}
                          <br />
                          {offer.endsAt
                            ? `Ends ${new Intl.DateTimeFormat('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }).format(offer.endsAt)}`
                            : 'No end date'}
                        </td>
                        <td>
                          <Badge
                            bg={statusVariant[offer.status]}
                            text={offer.status === 'DRAFT' ? 'dark' : undefined}
                          >
                            {statusLabel(offer.status)}
                          </Badge>
                        </td>
                        <td>
                          <div className="align-items-start d-flex flex-column gap-2">
                            <Link
                              className="btn btn-outline-primary btn-sm"
                              href={`/admin/offers/${offer.id}/edit`}
                            >
                              Edit details
                            </Link>
                            {offer.status !== 'ARCHIVED' ? (
                              <form action={changeOfferPublication}>
                                <input
                                  name="offerId"
                                  type="hidden"
                                  value={offer.id}
                                />
                                <input
                                  name="action"
                                  type="hidden"
                                  value={action}
                                />
                                <button
                                  className={`btn btn-sm ${
                                    offer.status === 'PUBLISHED'
                                      ? 'btn-outline-secondary'
                                      : 'btn-outline-success'
                                  }`}
                                  disabled={action === 'PUBLISH' && !canPublish}
                                  type="submit"
                                >
                                  {offer.status === 'PUBLISHED'
                                    ? 'Move to draft'
                                    : 'Publish'}
                                </button>
                              </form>
                            ) : null}
                            {offer.status !== 'ARCHIVED' ? (
                              <form action={changeOfferPublication}>
                                <input
                                  name="offerId"
                                  type="hidden"
                                  value={offer.id}
                                />
                                <input
                                  name="action"
                                  type="hidden"
                                  value="ARCHIVE"
                                />
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  type="submit"
                                >
                                  Archive
                                </button>
                              </form>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
