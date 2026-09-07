import { DraftProductForm } from '@/components/catalogue/draft-product-form';
import { requireOwnerPageSession } from '@/features/auth/server/session';
import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';

export default async function EditCatalogueProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwnerPageSession();
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });
  if (!product) notFound();

  return (
    <>
      <section className="mb-4">
        <Link className="small" href="/admin/catalogue">
          ← Back to products
        </Link>
        <p className="mb-2 mt-3 small text-secondary text-uppercase">
          Catalogue product
        </p>
        <h1 className="display-6 fw-semibold mb-2">Edit {product.name}</h1>
        <p className="mb-0 text-secondary">
          Update the buyer-facing product information. Use Manage media for
          images and the product list for publication controls.
        </p>
      </section>
      <Card className="shadow-sm">
        <CardBody className="p-4 p-md-5">
          <DraftProductForm
            product={{
              id: product.id,
              categoryName: product.category.name,
              name: product.name,
              summary: product.summary,
              description: product.description,
              grade: product.grade,
              form: product.form,
              applications: product.applications,
              minimumOrderQty: product.minimumOrderQty?.toString() ?? null,
              orderUnit: product.orderUnit,
              availability: product.availability,
            }}
          />
        </CardBody>
      </Card>
    </>
  );
}
