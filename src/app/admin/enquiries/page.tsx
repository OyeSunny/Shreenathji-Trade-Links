import { changeEnquiryStatus } from '@/app/admin/enquiries/actions';
import { db } from '@/lib/db';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardHeader from 'react-bootstrap/CardHeader';
import Table from 'react-bootstrap/Table';

const statusVariant = {
  IN_PROGRESS: 'primary',
  LOST: 'secondary',
  NEW: 'warning',
  QUOTED: 'info',
  SPAM: 'dark',
  WON: 'success',
} as const;

const statusLabel = (status: keyof typeof statusVariant) =>
  status.replaceAll('_', ' ').toLowerCase();

export default async function AdminEnquiriesPage() {
  const enquiries = await db.enquiry.findMany({
    include: {
      items: {
        select: {
          quantity: true,
          unit: true,
          product: { select: { name: true } },
          offer: { select: { title: true } },
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
    take: 100,
  });

  return (
    <>
      <section className="mb-4">
        <p className="mb-2 small text-secondary text-uppercase">
          Buyer enquiries
        </p>
        <h1 className="display-6 fw-semibold mb-2">Quote requests</h1>
        <p className="mb-0 text-secondary">
          Review the latest buyer requirements and keep each conversation
          moving.
        </p>
      </section>

      <Card className="shadow-sm">
        <CardHeader className="bg-white border-bottom-0 d-flex justify-content-between py-3">
          <span className="fw-semibold">Latest enquiries</span>
          <span className="small text-secondary">{enquiries.length} shown</span>
        </CardHeader>
        <CardBody className="p-0">
          {enquiries.length === 0 ? (
            <Alert className="m-4 mb-0" variant="light">
              No quote requests yet. Buyer submissions from the public form will
              appear here.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table className="align-middle mb-0" hover>
                <thead>
                  <tr>
                    <th scope="col">Buyer</th>
                    <th scope="col">Requirement</th>
                    <th scope="col">Market</th>
                    <th scope="col">Received</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enquiry) => {
                    const quantity = enquiry.items[0]?.quantity;
                    const unit = enquiry.items[0]?.unit;
                    const product = enquiry.items[0]?.product;
                    const offer = enquiry.items[0]?.offer;

                    return (
                      <tr key={enquiry.id}>
                        <td>
                          <span className="d-block fw-semibold">
                            {enquiry.contactName}
                          </span>
                          <a className="small" href={`mailto:${enquiry.email}`}>
                            {enquiry.email}
                          </a>
                          {enquiry.companyName ? (
                            <span className="d-block small text-secondary">
                              {enquiry.companyName}
                            </span>
                          ) : null}
                        </td>
                        <td>
                          <span
                            className="d-block"
                            style={{ maxWidth: '24rem' }}
                          >
                            {enquiry.materialRequest}
                          </span>
                          {quantity ? (
                            <span className="small text-secondary">
                              {quantity.toString()} {unit ?? ''}
                            </span>
                          ) : null}
                          {product ? (
                            <span className="d-block small text-secondary">
                              Product: {product.name}
                              {offer ? ` / Offer: ${offer.title}` : ''}
                            </span>
                          ) : null}
                        </td>
                        <td>
                          <Badge
                            bg={
                              enquiry.type === 'EXPORT' ? 'info' : 'secondary'
                            }
                          >
                            {enquiry.type === 'EXPORT' ? 'Export' : 'India'}
                          </Badge>
                          {enquiry.destinationCountry ? (
                            <span className="d-block small text-secondary mt-1">
                              {enquiry.destinationCountry}
                            </span>
                          ) : null}
                        </td>
                        <td className="text-nowrap small text-secondary">
                          {new Intl.DateTimeFormat('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }).format(enquiry.submittedAt)}
                        </td>
                        <td>
                          <form
                            action={changeEnquiryStatus}
                            className="d-flex gap-2"
                          >
                            <input
                              name="enquiryId"
                              type="hidden"
                              value={enquiry.id}
                            />
                            <select
                              aria-label={`Status for ${enquiry.contactName}`}
                              className="form-select form-select-sm"
                              defaultValue={enquiry.status}
                              name="status"
                            >
                              {Object.keys(statusVariant).map((status) => (
                                <option key={status} value={status}>
                                  {statusLabel(
                                    status as keyof typeof statusVariant,
                                  )}
                                </option>
                              ))}
                            </select>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              type="submit"
                            >
                              Save
                            </button>
                          </form>
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
