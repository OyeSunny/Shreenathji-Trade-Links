import { DraftProductForm } from '@/components/catalogue/draft-product-form';
import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';

export default function NewCatalogueProductPage() {
  return (
    <>
      <section className="mb-4">
        <Link className="small" href="/admin/catalogue">
          ← Back to products
        </Link>
        <p className="mb-2 mt-3 small text-secondary text-uppercase">
          New catalogue draft
        </p>
        <h1 className="display-6 fw-semibold mb-2">Add a product</h1>
        <p className="mb-0 text-secondary">
          Capture the essentials now. You can add images and control public
          visibility from the catalogue after saving.
        </p>
      </section>
      <Card className="shadow-sm">
        <CardBody className="p-4 p-md-5">
          <DraftProductForm />
        </CardBody>
      </Card>
    </>
  );
}
