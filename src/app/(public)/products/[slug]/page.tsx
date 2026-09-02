import Link from 'next/link';
import { notFound } from 'next/navigation';
import Container from 'react-bootstrap/Container';

import { ProductImageCarousel } from '@/components/catalogue/product-image-carousel';
import {
  getPublicImageUrl,
  getPublishedProductBySlug,
} from '@/features/catalogue/server/public-catalogue';

import styles from '../products.module.css';

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function formatAvailability(availability: string) {
  return availability.replaceAll('_', ' ').toLowerCase();
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) notFound();

  const productImages = product.media.reduce<
    Array<{ alt: string; src: string }>
  >((images, productMedia) => {
    const src = getPublicImageUrl(productMedia.media);

    if (src) {
      images.push({
        src,
        alt: productMedia.altText ?? productMedia.media.altText ?? product.name,
      });
    }

    return images;
  }, []);
  const details = [
    product.grade ? { label: 'Grade', value: product.grade } : null,
    product.form ? { label: 'Form', value: product.form } : null,
    product.packaging ? { label: 'Packaging', value: product.packaging } : null,
    product.minimumOrderQty
      ? {
          label: 'Minimum order',
          value: `${product.minimumOrderQty.toString()}${product.orderUnit ? ` ${product.orderUnit}` : ''}`,
        }
      : null,
    { label: 'Availability', value: formatAvailability(product.availability) },
  ].filter(
    (detail): detail is { label: string; value: string } => detail !== null,
  );

  return (
    <main>
      <section className={`${styles.detailHero} py-4 py-lg-5`}>
        <Container>
          <Link className={styles.backLink} href="/products">
            <span aria-hidden="true">← </span>All materials
          </Link>
          <p className={`${styles.catalogueKicker} mt-5 mb-2`}>
            {product.category.name}
          </p>
          <h1 className={styles.detailTitle}>{product.name}</h1>
          <p className={styles.detailSummary}>{product.summary}</p>
        </Container>
      </section>

      <section className="py-5 py-lg-6">
        <Container>
          <div className="row g-5">
            <div className="col-lg-7">
              {productImages.length > 0 ? (
                <ProductImageCarousel
                  className={styles.detailImage}
                  images={productImages}
                />
              ) : (
                <div
                  aria-label={`${product.name} image pending`}
                  className={styles.detailImagePlaceholder}
                  role="img"
                >
                  STL Material
                </div>
              )}

              {product.description ? (
                <div className="mt-5">
                  <p className="section-label">Material overview</p>
                  <p className="fs-5 lh-lg mb-0">{product.description}</p>
                </div>
              ) : null}

              {product.applications.length > 0 ? (
                <div className="mt-5">
                  <p className="section-label">Common applications</p>
                  <div>
                    {product.applications.map((application) => (
                      <span className={styles.tag} key={application}>
                        {application}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="col-lg-5">
              <div className="mb-5">
                <p className="section-label">At a glance</p>
                <dl className={styles.specList}>
                  {details.map((detail) => (
                    <div key={detail.label}>
                      <dt>{detail.label}</dt>
                      <dd className="text-capitalize">{detail.value}</dd>
                    </div>
                  ))}
                  {product.specifications.map((specification) => (
                    <div key={specification.id}>
                      <dt>{specification.label}</dt>
                      <dd>
                        {specification.value}
                        {specification.unit ? ` ${specification.unit}` : ''}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <aside
                className={styles.enquiryPanel}
                aria-labelledby="enquire-heading"
              >
                <p className="section-label text-warning mb-2">
                  Need this material?
                </p>
                <h2 id="enquire-heading" className="h3">
                  Request a direct quote.
                </h2>
                <p>
                  Share the grade, quantity, destination and timeline. Our team
                  will respond with the next practical step.
                </p>
                <Link
                  className="btn btn-warning w-100"
                  href={`/request-a-quote?product=${encodeURIComponent(product.slug)}`}
                >
                  Enquire about {product.name}
                </Link>
              </aside>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
