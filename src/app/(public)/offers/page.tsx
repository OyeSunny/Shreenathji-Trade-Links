import Link from 'next/link';
import Container from 'react-bootstrap/Container';

import { ManagedImage } from '@/components/media/managed-image';
import { getPublicImageUrl } from '@/features/catalogue/server/public-catalogue';
import { getPublishedOffers } from '@/features/offers/server/public-offers';

import styles from './offers.module.css';

export default async function OffersPage() {
  const offers = await getPublishedOffers();

  return (
    <main>
      <section className={`${styles.hero} py-5 py-lg-6`}>
        <Container>
          <p className={styles.kicker}>Current material opportunities</p>
          <h1 className={styles.title}>
            Available now. Built for a direct conversation.
          </h1>
          <p className={styles.lede}>
            See the material opportunities currently open for enquiry. Share
            your specification, quantity, and destination to discuss fit and
            availability directly.
          </p>
        </Container>
      </section>

      <section
        aria-labelledby="offers-list-heading"
        className={`${styles.offerList} py-5 py-lg-6`}
      >
        <Container>
          <div className="align-items-sm-end d-flex flex-column flex-sm-row gap-2 gap-sm-4 justify-content-between mb-4 mb-lg-5">
            <div>
              <p className="section-label mb-2">Open to enquiry</p>
              <h2 id="offers-list-heading" className="mb-0">
                Current offers.
              </h2>
            </div>
            {offers.length > 0 ? (
              <p className="mb-0 text-secondary text-nowrap">
                {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
              </p>
            ) : null}
          </div>

          {offers.length === 0 ? (
            <div className="border p-4 p-md-5 text-center">
              <p className="section-label mb-2">Offers updating</p>
              <h2 className="h3">No public offers are listed right now.</h2>
              <p className="mb-4 text-secondary">
                If you have a current sourcing requirement, send the material
                details and we will discuss the available route directly.
              </p>
              <Link className="btn btn-primary" href="/request-a-quote">
                Request a quote <span aria-hidden="true">↗</span>
              </Link>
            </div>
          ) : (
            <div className={styles.offerGrid}>
              {offers.map((offer) => {
                const image = offer.product.media[0];
                const imageUrl = getPublicImageUrl(image?.media ?? null);

                return (
                  <div className={styles.offerGridItem} key={offer.id}>
                    <Link
                      className={styles.offerCard}
                      href={`/offers/${offer.slug}`}
                    >
                      {imageUrl ? (
                        <ManagedImage
                          alt={
                            image?.altText ??
                            image?.media.altText ??
                            offer.product.name
                          }
                          className={styles.offerImage}
                          sizes="(max-width: 575px) 86vw, (max-width: 991px) 50vw, 33vw"
                          src={imageUrl}
                        />
                      ) : (
                        <span
                          aria-label={`${offer.product.name} image pending`}
                          className={styles.offerImagePlaceholder}
                          role="img"
                        >
                          STL Material
                        </span>
                      )}
                      <span className={styles.offerCardBody}>
                        <span className={styles.productLine}>
                          {offer.product.category.name} / {offer.product.name}
                        </span>
                        <span className={styles.offerName}>{offer.title}</span>
                        <span className={styles.summary}>{offer.summary}</span>
                        <span className={styles.cardAction}>
                          View offer <span aria-hidden="true">→</span>
                        </span>
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
