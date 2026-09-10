import Link from 'next/link';
import Carousel from 'react-bootstrap/Carousel';
import CarouselItem from 'react-bootstrap/CarouselItem';
import Container from 'react-bootstrap/Container';

import { SectionReveal } from '@/components/layout/section-reveal';
import { ManagedImage } from '@/components/media/managed-image';
import { BuyerFeedbackCarousel } from '@/components/reviews/buyer-feedback-carousel';
import { formatPublicProductPrice } from '@/features/catalogue/product-price';
import {
  getPublicImageUrl,
  getPublishedProducts,
} from '@/features/catalogue/server/public-catalogue';
import { getWebsiteContent } from '@/features/content/server/site-content';
import { getPublishedCustomerReviews } from '@/features/reviews/server/public-reviews';

export default async function HomePage() {
  const [publishedProducts, reviews, websiteContent] = await Promise.all([
    getPublishedProducts(),
    getPublishedCustomerReviews(),
    getWebsiteContent(),
  ]);
  const products = publishedProducts.slice(0, 6);
  const content = websiteContent.homePageContent;
  const marqueeItems = [...content.marqueeItems, ...content.marqueeItems];

  return (
    <main>
      <section className="hero-section" aria-labelledby="home-title">
        <Carousel fade interval={7000} pause="hover">
          {content.heroSlides.map((slide, index) => {
            const Heading = index === 0 ? 'h1' : 'h2';

            return (
              <CarouselItem key={`${slide.imageSrc}-${index}`}>
                <ManagedImage
                  alt={slide.imageAlt}
                  className="hero-slide__image"
                  priority={index === 0}
                  sizes="100vw"
                  src={slide.imageSrc}
                />
                <div className="hero-slide__veil" aria-hidden="true" />
                <Container className="hero-slide__content">
                  <div className="hero-section__eyebrow">{slide.eyebrow}</div>
                  <Heading id={index === 0 ? 'home-title' : undefined}>
                    {slide.title}
                  </Heading>
                  <p className="hero-section__lede">{slide.lede}</p>
                  <div className="hero-slide__actions d-flex flex-wrap gap-3">
                    <Link
                      className="btn btn-primary btn-lg"
                      href={slide.primaryHref}
                    >
                      {slide.primaryLabel} <span aria-hidden="true">↗</span>
                    </Link>
                    <Link
                      className="btn btn-outline-light btn-lg"
                      href={slide.secondaryHref}
                    >
                      {slide.secondaryLabel}
                    </Link>
                  </div>
                  <p className="hero-slide__index mb-0">
                    {String(index + 1).padStart(2, '0')} / {slide.indexLabel}
                  </p>
                </Container>
              </CarouselItem>
            );
          })}
        </Carousel>
        <div aria-hidden="true" className="bauhaus-forms">
          <span className="bauhaus-forms__disc" />
          <span className="bauhaus-forms__square" />
          <span className="bauhaus-forms__bar" />
        </div>
      </section>

      <div aria-label="Material supply highlights" className="trade-marquee">
        <div className="trade-marquee__track">
          {marqueeItems.map((item, index) => (
            <span className="trade-marquee__item" key={`${item}-${index}`}>
              {item}
              <i aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

      <section
        className="border-bottom border-top"
        aria-label="Business highlights"
      >
        <Container className="py-4">
          <div className="row g-4 text-center text-md-start">
            {content.highlights.map((highlight) => (
              <div className="col-md-4" key={highlight.title}>
                <strong>{highlight.title}</strong>
                <br />
                <span className="text-secondary">{highlight.text}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <SectionReveal>
        <section
          className="featured-catalogue py-5 py-lg-6"
          aria-labelledby="materials-heading"
        >
          <Container>
            <div className="d-lg-flex justify-content-between mb-4 mb-lg-5">
              <div>
                <p className="section-label">{content.catalogueEyebrow}</p>
                <h2 id="materials-heading">{content.catalogueTitle}</h2>
              </div>
              <Link className="align-self-end link-arrow" href="/products">
                {content.catalogueLinkLabel} <span aria-hidden="true">→</span>
              </Link>
            </div>
            {products.length > 0 ? (
              <>
                <div
                  aria-label="Featured materials"
                  className="home-product-rail row g-4"
                  role="list"
                >
                  {products.map((product) => {
                    const primaryImage = product.media[0];
                    const imageUrl = getPublicImageUrl(
                      primaryImage?.media ?? null,
                    );
                    const publicPrice = formatPublicProductPrice(product);

                    return (
                      <div
                        className="col-md-6 col-xl-4"
                        key={product.id}
                        role="listitem"
                      >
                        <Link
                          aria-label={`View ${product.name}`}
                          className="home-product-card"
                          href={`/products/${product.slug}`}
                        >
                          {imageUrl ? (
                            <span className="home-product-card__media">
                              <ManagedImage
                                alt={
                                  primaryImage?.altText ??
                                  primaryImage?.media.altText ??
                                  product.name
                                }
                                className="home-product-card__image"
                                sizes="(max-width: 575px) 86vw, (max-width: 991px) 50vw, 33vw"
                                src={imageUrl}
                              />
                              <span
                                aria-hidden="true"
                                className="home-product-card__watermark"
                              >
                                Shreenathji Trade Links
                              </span>
                            </span>
                          ) : (
                            <span
                              aria-label={`${product.name} image pending`}
                              className="home-product-card__placeholder"
                              role="img"
                            >
                              STL
                            </span>
                          )}
                          <span className="home-product-card__body">
                            <span className="home-product-card__category">
                              {product.category.name}
                            </span>
                            <span className="home-product-card__name">
                              {product.name}
                            </span>
                            <span className="home-product-card__summary">
                              {product.summary}
                            </span>
                            <span className="home-product-card__price">
                              <span className="home-product-card__price-label">
                                {publicPrice ? 'Indicative price' : 'Pricing'}
                              </span>
                              <span className="home-product-card__price-value">
                                {publicPrice ?? 'Price on request'}
                              </span>
                            </span>
                            <span className="home-product-card__link">
                              View material <span aria-hidden="true">→</span>
                            </span>
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
                <p aria-hidden="true" className="home-product-rail__hint">
                  Swipe to explore <span>→</span>
                </p>
              </>
            ) : (
              <div className="catalogue-empty-state">
                <p className="section-label">Catalogue being prepared</p>
                <p className="mb-0">
                  Send the material, quantity, and destination to begin an
                  enquiry now.
                </p>
              </div>
            )}
          </Container>
        </section>
      </SectionReveal>

      <SectionReveal delay="short">
        <section
          className="enquiry-process py-5 py-lg-6"
          aria-labelledby="process-heading"
        >
          <Container>
            <div className="row g-5 align-items-end">
              <div className="col-lg-5">
                <p className="section-label">{content.processEyebrow}</p>
                <h2 id="process-heading">{content.processTitle}</h2>
                <p className="fs-5 mb-0 text-secondary">
                  {content.processLede}
                </p>
              </div>
              <div className="col-lg-7">
                <ol className="process-steps">
                  {content.processSteps.map((step, index) => (
                    <li key={step.title}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </section>
      </SectionReveal>

      <SectionReveal>
        <BuyerFeedbackCarousel reviews={reviews} />
      </SectionReveal>

      <SectionReveal delay="short">
        <section className="dark-band py-5" aria-labelledby="enquiry-heading">
          <Container className="row align-items-center g-4 mx-auto">
            <div className="col-lg-8">
              <p className="section-label text-warning">
                {content.closingEyebrow}
              </p>
              <h2 id="enquiry-heading">{content.closingTitle}</h2>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link
                className="btn btn-warning btn-lg"
                href={content.closingButtonHref}
              >
                {content.closingButtonLabel}
              </Link>
            </div>
          </Container>
        </section>
      </SectionReveal>
    </main>
  );
}
