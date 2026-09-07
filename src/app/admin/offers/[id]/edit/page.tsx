import { CreateOfferForm } from '@/components/offers/create-offer-form';
import { requireOwnerPageSession } from '@/features/auth/server/session';
import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';

const dateInputValue = (date: Date | null) =>
  date ? date.toISOString().slice(0, 10) : null;

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwnerPageSession();
  const { id } = await params;
  const [offer, products] = await Promise.all([
    db.offer.findUnique({ where: { id } }),
    db.product.findMany({
      select: { id: true, name: true, status: true },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    }),
  ]);
  if (!offer) notFound();

  return (
    <>
      <Link className="btn btn-link mb-3 px-0" href="/admin/offers">
        <span aria-hidden="true">← </span>Back to offers
      </Link>
      <section className="mb-4">
        <p className="mb-2 small text-secondary text-uppercase">Offer</p>
        <h1 className="display-6 fw-semibold mb-2">Edit {offer.title}</h1>
        <p className="mb-0 text-secondary">
          Update the buyer-facing message, linked material, and availability
          window. Keep commercial pricing in the direct quote conversation.
        </p>
      </section>
      <Card className="shadow-sm">
        <CardBody className="p-4 p-md-5">
          <CreateOfferForm
            offer={{
              id: offer.id,
              productId: offer.productId,
              title: offer.title,
              summary: offer.summary,
              details: offer.details,
              startsAt: dateInputValue(offer.startsAt),
              endsAt: dateInputValue(offer.endsAt),
            }}
            products={products}
          />
        </CardBody>
      </Card>
    </>
  );
}
