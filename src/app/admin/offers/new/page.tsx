import { CreateOfferForm } from '@/components/offers/create-offer-form';
import { db } from '@/lib/db';
import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';

export default async function NewOfferPage() {
  const products = await db.product.findMany({
    select: { id: true, name: true, status: true },
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
  });

  return (
    <>
      <Link className="btn btn-link mb-3 px-0" href="/admin/offers">
        <span aria-hidden="true">← </span>Back to offers
      </Link>
      <section className="mb-4">
        <p className="mb-2 small text-secondary text-uppercase">New offer</p>
        <h1 className="display-6 fw-semibold mb-2">Prepare an offer</h1>
        <p className="mb-0 text-secondary">
          Keep commercial terms in the direct conversation. This public page
          should invite a qualified quote request.
        </p>
      </section>
      <Card className="shadow-sm">
        <CardBody className="p-4 p-md-5">
          {products.length > 0 ? (
            <CreateOfferForm products={products} />
          ) : (
            <div className="text-center py-4">
              <h2 className="h5">Add a product first</h2>
              <p className="text-secondary">
                Offers always stay connected to a catalogue product.
              </p>
              <Link className="btn btn-primary" href="/admin/catalogue/new">
                Add draft product
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
