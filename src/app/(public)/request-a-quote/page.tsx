import { RequestQuoteForm } from '@/components/enquiries/request-quote-form';
import { getPublishedProductBySlug } from '@/features/catalogue/server/public-catalogue';
import { getPublishedOfferBySlug } from '@/features/offers/server/public-offers';
import Container from 'react-bootstrap/Container';

export default async function RequestQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string; product?: string }>;
}) {
  const params = await searchParams;
  const offer = params.offer
    ? await getPublishedOfferBySlug(params.offer)
    : null;
  const product = offer
    ? offer.product
    : params.product
      ? await getPublishedProductBySlug(params.product)
      : null;

  return (
    <main className="page-shell quote-page">
      <section className="page-hero">
        <Container>
          <div className="page-hero__grid">
            <div>
              <p className="section-label">Buyer enquiry / 01</p>
              <h1 className="page-hero__title">
                Start with the material brief.
              </h1>
            </div>
            <p className="page-hero__lede">
              Tell us what is needed, where it is required, and the estimated
              quantity. We will use those details to take the right next step.
            </p>
          </div>
        </Container>
      </section>
      <section className="quote-page__body">
        <Container>
          <div className="row g-0 quote-layout">
            <aside className="col-lg-4 quote-layout__brief">
              <p className="section-label">A useful first message</p>
              <h2>Give the supply desk the essentials.</h2>
              <ol className="quote-brief-list">
                <li>
                  <span>01</span>
                  <div>
                    <strong>Material specification</strong>
                    <p>Grade, size, packaging, and certificates if relevant.</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>Commercial context</strong>
                    <p>
                      Approximate quantity and whether it is a domestic or
                      export enquiry.
                    </p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>Destination</strong>
                    <p>
                      Country, city, or port so the discussion can be routed
                      correctly.
                    </p>
                  </div>
                </li>
              </ol>
            </aside>
            <div className="col-lg-8 quote-layout__form">
              <RequestQuoteForm
                offer={
                  offer ? { slug: offer.slug, title: offer.title } : undefined
                }
                product={
                  product
                    ? { slug: product.slug, name: product.name }
                    : undefined
                }
              />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
