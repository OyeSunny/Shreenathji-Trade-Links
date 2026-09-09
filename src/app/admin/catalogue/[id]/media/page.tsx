import {
  removeProductMedia,
  setPrimaryProductMedia,
  setProductMediaCaption,
  setProductMediaSortOrder,
} from '@/app/admin/catalogue/actions';
import { AdminMediaImageViewer } from '@/components/admin/admin-media-image-viewer';
import { ProductMediaForm } from '@/components/catalogue/product-media-form';
import { requireOwnerPageSession } from '@/features/auth/server/session';
import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';
import CardHeader from 'react-bootstrap/CardHeader';

const rightsVariant = {
  APPROVED: 'success',
  PENDING_VERIFICATION: 'warning',
  RESTRICTED: 'secondary',
} as const;

const publicationVariant = {
  ARCHIVED: 'secondary',
  DRAFT: 'warning',
  PUBLISHED: 'success',
} as const;

const rightsLabel = {
  APPROVED: 'Rights approved',
  PENDING_VERIFICATION: 'Rights pending',
  RESTRICTED: 'Rights restricted',
} as const;

export default async function ProductMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwnerPageSession();
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      media: {
        include: { media: true },
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      },
    },
  });

  if (!product) notFound();

  return (
    <>
      <section className="mb-4">
        <Link className="small" href="/admin/catalogue">
          ← Back to products
        </Link>
        <p className="mb-2 mt-3 small text-secondary text-uppercase">
          Product carousel
        </p>
        <h1 className="display-6 fw-semibold mb-2">{product.name} images</h1>
        <p className="mb-0 text-secondary">
          Add the material views buyers need, pick the card image, and set the
          order used by the product carousel.
        </p>
      </section>

      <div className="row g-4 align-items-start">
        <div className="col-lg-5">
          <Card className="shadow-sm">
            <CardHeader className="bg-white border-bottom-0 py-3">
              <span className="fw-semibold">Add an image</span>
            </CardHeader>
            <CardBody className="pt-0">
              <ProductMediaForm productId={product.id} />
            </CardBody>
          </Card>
        </div>

        <div className="col-lg-7">
          <Card className="shadow-sm">
            <CardHeader className="bg-white border-bottom-0 d-flex justify-content-between py-3">
              <span className="fw-semibold">Carousel sequence</span>
              <span className="small text-secondary">
                {product.media.length} image
                {product.media.length === 1 ? '' : 's'}
              </span>
            </CardHeader>
            <CardBody className="pt-0">
              {product.media.length === 0 ? (
                <Alert className="mb-0" variant="light">
                  No images yet. Add a project image to create the first public
                  carousel slide.
                </Alert>
              ) : (
                <div className="d-grid gap-3">
                  {product.media.map((productMedia) => {
                    const isPublic =
                      productMedia.media.rightsStatus === 'APPROVED' &&
                      productMedia.media.status === 'PUBLISHED';

                    return (
                      <article
                        className="border d-flex flex-column gap-3 p-3 rounded-3"
                        key={productMedia.mediaId}
                      >
                        <div className="d-flex flex-column flex-sm-row gap-3">
                          {productMedia.media.sourceUrl ? (
                            <AdminMediaImageViewer
                              alt={
                                productMedia.altText ??
                                productMedia.media.altText ??
                                `${product.name} product image`
                              }
                              src={productMedia.media.sourceUrl}
                            />
                          ) : (
                            <div
                              className="align-items-center bg-light border d-flex flex-shrink-0 justify-content-center rounded-2 small text-secondary"
                              style={{ height: 108, width: 144 }}
                            >
                              Image unavailable
                            </div>
                          )}
                          <div className="flex-grow-1">
                            <div className="align-items-start d-flex flex-wrap gap-2 justify-content-between">
                              <p className="fw-semibold mb-1 text-break">
                                {productMedia.media.fileName}
                              </p>
                              {productMedia.isPrimary ? (
                                <Badge bg="primary">Primary image</Badge>
                              ) : null}
                            </div>
                            <p className="mb-2 small text-secondary">
                              {productMedia.altText ??
                                productMedia.media.altText ??
                                'No image description'}
                            </p>
                            <form action={setProductMediaCaption}>
                              <input
                                name="productId"
                                type="hidden"
                                value={product.id}
                              />
                              <input
                                name="mediaId"
                                type="hidden"
                                value={productMedia.mediaId}
                              />
                              <label className="d-block mb-2 small text-secondary">
                                Buyer-facing variant title
                                <input
                                  className="form-control form-control-sm mt-1"
                                  defaultValue={productMedia.caption ?? ''}
                                  maxLength={100}
                                  name="caption"
                                  placeholder="e.g. Mill Scale Fe 70"
                                  required
                                  type="text"
                                />
                              </label>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                type="submit"
                              >
                                Save title
                              </button>
                            </form>
                            <div className="d-flex flex-wrap gap-2">
                              <Badge
                                bg={
                                  rightsVariant[productMedia.media.rightsStatus]
                                }
                                text={
                                  productMedia.media.rightsStatus ===
                                  'PENDING_VERIFICATION'
                                    ? 'dark'
                                    : undefined
                                }
                              >
                                {rightsLabel[productMedia.media.rightsStatus]}
                              </Badge>
                              <Badge
                                bg={
                                  publicationVariant[productMedia.media.status]
                                }
                                text={
                                  productMedia.media.status === 'DRAFT'
                                    ? 'dark'
                                    : undefined
                                }
                              >
                                {isPublic ? 'Public' : 'Private draft'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="align-items-end d-flex flex-column flex-sm-row gap-2 justify-content-between">
                          <div className="d-flex flex-wrap gap-2">
                            {!productMedia.isPrimary ? (
                              <form action={setPrimaryProductMedia}>
                                <input
                                  name="productId"
                                  type="hidden"
                                  value={product.id}
                                />
                                <input
                                  name="mediaId"
                                  type="hidden"
                                  value={productMedia.mediaId}
                                />
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  type="submit"
                                >
                                  Make primary
                                </button>
                              </form>
                            ) : null}
                            <form action={removeProductMedia}>
                              <input
                                name="productId"
                                type="hidden"
                                value={product.id}
                              />
                              <input
                                name="mediaId"
                                type="hidden"
                                value={productMedia.mediaId}
                              />
                              <button
                                className="btn btn-outline-danger btn-sm"
                                type="submit"
                              >
                                Remove
                              </button>
                            </form>
                          </div>
                          <form
                            action={setProductMediaSortOrder}
                            className="align-items-end d-flex gap-2"
                          >
                            <input
                              name="productId"
                              type="hidden"
                              value={product.id}
                            />
                            <input
                              name="mediaId"
                              type="hidden"
                              value={productMedia.mediaId}
                            />
                            <label className="small text-secondary">
                              Carousel order
                              <input
                                className="form-control form-control-sm mt-1"
                                defaultValue={productMedia.sortOrder}
                                min="0"
                                name="sortOrder"
                                type="number"
                              />
                            </label>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              type="submit"
                            >
                              Save
                            </button>
                          </form>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
