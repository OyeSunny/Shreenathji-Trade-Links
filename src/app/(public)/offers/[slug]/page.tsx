import { getPublicImageUrl } from '@/features/catalogue/server/public-catalogue';
import { getPublishedOfferBySlug } from '@/features/offers/server/public-offers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Container from 'react-bootstrap/Container';

import styles from '../offers.module.css';

type OfferDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OfferDetailPage({
  params,
}: OfferDetailPageProps) {
  const { slug } = await params;
  const offer = await getPublishedOfferBySlug(slug);

  if (!offer) notFound();

  const image = offer.product.media[0];
  const imageUrl = getPublicImageUrl(image?.media ?? null);
  const endDate = offer.endsAt
    ? new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(offer.endsAt)
    : null;

  return (
    <main>
      <section className={`${styles.hero} py-4 py-lg-5`}>
        <Container>
          <Link className="link-light link-underline-opacity-0" href="/offers">
            <span aria-hidden="true">← </span>All offers
          </Link>
          <p className={`${styles.kicker} mt-5 mb-2`}>
            {offer.product.category.name} / {offer.product.name}
          </p>
          <h1 className={styles.title}>{offer.title}</h1>
          <p className={styles.lede}>{offer.summary}</p>
        </Container>
      </section>

      <section className="py-5 py-lg-6">
        <Container>
          <div className="row g-5">
            <div className="col-lg-7">
              {imageUrl ? (
                // This is an owner-managed approved public media URL.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={
                    image?.altText ?? image?.media.altText ?? offer.product.name
                  }
                  className="img-fluid w-100"
                  src={imageUrl}
                />
              ) : (
                <div
                  className={`${styles.offerImagePlaceholder} ratio ratio-4x3`}
                >
                  STL Material
                </div>
              )}

              {offer.details ? (
                <div className="mt-5">
                  <p className="section-label">Offer details</p>
                  <p className="fs-5 lh-lg mb-0">{offer.details}</p>
                </div>
              ) : null}
            </div>
            <aside className="col-lg-5">
              <div className={styles.detailPanel}>
                <p className={`${styles.kicker} mb-2`}>Direct buyer enquiry</p>
                <h2 className="h2">Discuss this material opportunity.</h2>
                <p>
                  Send the grade, quantity, delivery point, and required timing.
                  We will take the right commercial conversation forward.
                </p>
                {endDate ? (
                  <p className="small text-white-50">Open until {endDate}</p>
                ) : null}
                <Link
                  className="btn btn-warning w-100"
                  href={`/request-a-quote?offer=${encodeURIComponent(offer.slug)}&product=${encodeURIComponent(offer.product.slug)}`}
                >
                  Enquire about this offer
                </Link>
              </div>
              <div className="border mt-4 p-4">
                <p className="section-label mb-2">Related material</p>
                <h2 className="h4">{offer.product.name}</h2>
                <p className="text-secondary">{offer.product.summary}</p>
                <Link href={`/products/${offer.product.slug}`}>
                  View material <span aria-hidden="true">→</span>
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
