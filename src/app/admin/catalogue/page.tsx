import { changeProductPublication } from '@/app/admin/catalogue/actions';
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

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const [products, parameters] = await Promise.all([
    db.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
    }),
    searchParams,
  ]);

  return (
    <>
      <section className="align-items-md-end d-flex flex-column flex-md-row gap-3 justify-content-between mb-4">
        <div>
          <p className="mb-2 small text-secondary text-uppercase">
            B2B catalogue
          </p>
          <h1 className="display-6 fw-semibold mb-2">Products</h1>
          <p className="mb-0 text-secondary">
            Prepare product information as drafts before publishing it for
            buyers.
          </p>
        </div>
        <Link className="btn btn-primary" href="/admin/catalogue/new">
          Add draft product
        </Link>
      </section>

      {parameters.created === '1' ? (
        <Alert variant="success">
          Draft product saved. It is not public yet.
        </Alert>
      ) : null}

      <Card className="shadow-sm">
        <CardHeader className="bg-white border-bottom-0 d-flex justify-content-between py-3">
          <span className="fw-semibold">All products</span>
          <span className="small text-secondary">{products.length} total</span>
        </CardHeader>
        <CardBody className="p-0">
          {products.length === 0 ? (
            <div className="p-4 p-md-5 text-center">
              <h2 className="h5">
                Your catalogue is ready for its first product
              </h2>
              <p className="mb-3 text-secondary">
                Start with a draft. You will be able to add imagery and more
                specifications as the catalogue grows.
              </p>
              <Link
                className="btn btn-outline-primary"
                href="/admin/catalogue/new"
              >
                Create first draft
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="align-middle mb-0" hover>
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Category</th>
                    <th scope="col">Availability</th>
                    <th scope="col">Status</th>
                    <th scope="col">Last updated</th>
                    <th scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <span className="d-block fw-semibold">
                          {product.name}
                        </span>
                        <span className="small text-secondary">
                          {product.summary}
                        </span>
                      </td>
                      <td>{product.category.name}</td>
                      <td>
                        {product.availability
                          .replaceAll('_', ' ')
                          .toLowerCase()}
                      </td>
                      <td>
                        <Badge
                          bg={statusVariant[product.status]}
                          text={product.status === 'DRAFT' ? 'dark' : undefined}
                        >
                          {statusLabel(product.status)}
                        </Badge>
                      </td>
                      <td className="text-nowrap text-secondary">
                        {new Intl.DateTimeFormat('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }).format(product.updatedAt)}
                      </td>
                      <td>
                        <form action={changeProductPublication}>
                          <input
                            name="productId"
                            type="hidden"
                            value={product.id}
                          />
                          <input
                            name="action"
                            type="hidden"
                            value={
                              product.status === 'PUBLISHED'
                                ? 'DRAFT'
                                : 'PUBLISH'
                            }
                          />
                          <button
                            className={`btn btn-sm ${
                              product.status === 'PUBLISHED'
                                ? 'btn-outline-secondary'
                                : 'btn-outline-success'
                            }`}
                            type="submit"
                          >
                            {product.status === 'PUBLISHED'
                              ? 'Move to draft'
                              : 'Publish'}
                          </button>
                        </form>
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
