import Link from 'next/link';
import Carousel from 'react-bootstrap/Carousel';
import CarouselItem from 'react-bootstrap/CarouselItem';
import Container from 'react-bootstrap/Container';

import { SectionReveal } from '@/components/layout/section-reveal';
import { DemoReviewPreview } from '@/components/reviews/demo-review-preview';
import {
  getPublicImageUrl,
  getPublishedProducts,
} from '@/features/catalogue/server/public-catalogue';

export default async function HomePage() {
  const products = (await getPublishedProducts()).slice(0, 6);

  return (
    <main>
      <section className="hero-section" aria-labelledby="home-title">
        <Carousel fade interval={7000} pause="hover">
          <CarouselItem>
            {/* This is a project-created image, not a buyer-uploaded product photo. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Iron ore material stockyard with port loading equipment"
              className="hero-slide__image"
              src="/media/industrial-ore-stockyard.png"
            />
            <div className="hero-slide__veil" aria-hidden="true" />
            <Container className="hero-slide__content">
              <div className="hero-section__eyebrow">
                Industrial raw materials · India & export
              </div>
              <h1 id="home-title">
                Material supply,
                <br />
                made dependable.
              </h1>
              <p className="hero-section__lede">
                Shreenathji Trade Links connects industrial buyers with bulk
                iron, carbon, and mineral materials—with clear specifications
                and direct enquiry support.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link
                  className="btn btn-primary btn-lg"
                  href="/request-a-quote"
                >
                  Request a quote <span aria-hidden="true">↗</span>
                </Link>
                <Link className="btn btn-outline-light btn-lg" href="/products">
                  Explore materials
                </Link>
              </div>
              <p className="hero-slide__index mb-0">01 / FERROUS MATERIALS</p>
            </Container>
          </CarouselItem>
          <CarouselItem>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Carbon materials at an industrial processing yard"
              className="hero-slide__image"
              src="/media/industrial-carbon-yard.png"
            />
            <div className="hero-slide__veil" aria-hidden="true" />
            <Container className="hero-slide__content">
              <div className="hero-section__eyebrow">
                Built for buyer clarity
              </div>
              <h2>
                Get the grade.
                <br />
                Know the route.
              </h2>
              <p className="hero-section__lede">
                Start with the material, volume, destination, and timeline. Our
                enquiry team keeps every next step direct and practical.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link
                  className="btn btn-primary btn-lg"
                  href="/request-a-quote"
                >
                  Send requirements <span aria-hidden="true">↗</span>
                </Link>
                <Link className="btn btn-outline-light btn-lg" href="/contact">
                  Talk to our team
                </Link>
              </div>
              <p className="hero-slide__index mb-0">02 / CARBON MATERIALS</p>
            </Container>
          </CarouselItem>
          <CarouselItem>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Dolomite aggregate quarry with processing machinery"
              className="hero-slide__image"
              src="/media/industrial-dolomite-quarry.png"
            />
            <div className="hero-slide__veil" aria-hidden="true" />
            <Container className="hero-slide__content">
              <div className="hero-section__eyebrow">
                Mineral supply, specified clearly
              </div>
              <h2>
                From source
                <br />
                to specification.
              </h2>
              <p className="hero-section__lede">
                Mineral requirements move faster when grade, form, and delivery
                details are clear from the first enquiry.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link className="btn btn-primary btn-lg" href="/products">
                  Browse materials <span aria-hidden="true">↗</span>
                </Link>
                <Link
                  className="btn btn-outline-light btn-lg"
                  href="/request-a-quote"
                >
                  Request a quote
                </Link>
              </div>
              <p className="hero-slide__index mb-0">03 / INDUSTRIAL MINERALS</p>
            </Container>
          </CarouselItem>
          <CarouselItem>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Bulk cargo export terminal with ship, containers, and loading equipment"
              className="hero-slide__image"
              src="/media/industrial-export-terminal.png"
            />
            <div className="hero-slide__veil" aria-hidden="true" />
            <Container className="hero-slide__content">
              <div className="hero-section__eyebrow">
                India & export enquiries
              </div>
              <h2>
                Logistics-aware
                <br />
                conversations.
              </h2>
              <p className="hero-section__lede">
                Tell us the destination, quantity, and timeline. We structure
                the first conversation around the supply route that matters.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link
                  className="btn btn-primary btn-lg"
                  href="/request-a-quote"
                >
                  Start an export enquiry <span aria-hidden="true">↗</span>
                </Link>
                <Link className="btn btn-outline-light btn-lg" href="/contact">
                  Contact us
                </Link>
              </div>
              <p className="hero-slide__index mb-0">04 / EXPORT LOGISTICS</p>
            </Container>
          </CarouselItem>
          <CarouselItem>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Melamine granules in industrial bulk handling"
              className="hero-slide__image"
              src="/media/industrial-melamine-granules.png"
            />
            <div className="hero-slide__veil" aria-hidden="true" />
            <Container className="hero-slide__content">
              <div className="hero-section__eyebrow">
                Material presentation matters
              </div>
              <h2>
                Ready for the
                <br />
                next requirement.
              </h2>
              <p className="hero-section__lede">
                From bulk minerals to specialist materials, share the
                specification and we will take the enquiry forward directly.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link
                  className="btn btn-primary btn-lg"
                  href="/request-a-quote"
                >
                  Send an enquiry <span aria-hidden="true">↗</span>
                </Link>
                <Link className="btn btn-outline-light btn-lg" href="/products">
                  View catalogue
                </Link>
              </div>
              <p className="hero-slide__index mb-0">
                05 / SPECIALITY MATERIALS
              </p>
            </Container>
          </CarouselItem>
        </Carousel>
        <div aria-hidden="true" className="bauhaus-forms">
          <span className="bauhaus-forms__disc" />
          <span className="bauhaus-forms__square" />
          <span className="bauhaus-forms__bar" />
        </div>
      </section>

      <div aria-label="Material supply highlights" className="trade-marquee">
        <div className="trade-marquee__track">
          <span>Industrial raw materials</span>
          <i aria-hidden="true" />
          <span>India · Export enquiries</span>
          <i aria-hidden="true" />
          <span>Grade · Quantity · Destination</span>
          <i aria-hidden="true" />
          <span>Direct buyer response</span>
          <i aria-hidden="true" />
          <span>Industrial raw materials</span>
          <i aria-hidden="true" />
          <span>India · Export enquiries</span>
          <i aria-hidden="true" />
          <span>Grade · Quantity · Destination</span>
          <i aria-hidden="true" />
          <span>Direct buyer response</span>
          <i aria-hidden="true" />
        </div>
      </div>

      <section
        className="border-bottom border-top"
        aria-label="Business highlights"
      >
        <Container className="py-4">
          <div className="row g-4 text-center text-md-start">
            <div className="col-md-4">
              <strong>Bulk-led sourcing</strong>
              <br />
              <span className="text-secondary">
                For industrial requirements
              </span>
            </div>
            <div className="col-md-4">
              <strong>Direct buyer enquiries</strong>
              <br />
              <span className="text-secondary">
                Clear material specifications
              </span>
            </div>
            <div className="col-md-4">
              <strong>India & international</strong>
              <br />
              <span className="text-secondary">Export-ready conversation</span>
            </div>
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
                <p className="section-label">Featured catalogue</p>
                <h2 id="materials-heading">Materials ready to quote.</h2>
              </div>
              <Link className="align-self-end link-arrow" href="/products">
                View all products <span aria-hidden="true">→</span>
              </Link>
            </div>
            {products.length > 0 ? (
              <div className="row g-4">
                {products.map((product) => {
                  const primaryImage = product.media[0];
                  const imageUrl = getPublicImageUrl(
                    primaryImage?.media ?? null,
                  );

                  return (
                    <div className="col-md-6 col-xl-4" key={product.id}>
                      <Link
                        aria-label={`View ${product.name}`}
                        className="home-product-card"
                        href={`/products/${product.slug}`}
                      >
                        {imageUrl ? (
                          // This image is a CMS-managed, rights-approved product asset.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={
                              primaryImage?.altText ??
                              primaryImage?.media.altText ??
                              product.name
                            }
                            className="home-product-card__image"
                            src={imageUrl}
                          />
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
                          <span className="home-product-card__link">
                            View material <span aria-hidden="true">→</span>
                          </span>
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </div>
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
                <p className="section-label">How enquiries move</p>
                <h2 id="process-heading">
                  A direct route from requirement to response.
                </h2>
                <p className="fs-5 mb-0 text-secondary">
                  No checkout flow or generic lead funnel. Start with the facts
                  that matter to your material requirement.
                </p>
              </div>
              <div className="col-lg-7">
                <ol className="process-steps">
                  <li>
                    <span>01</span>
                    <div>
                      <h3>Define the material</h3>
                      <p>Share grade, form, and application.</p>
                    </div>
                  </li>
                  <li>
                    <span>02</span>
                    <div>
                      <h3>Set the commercial context</h3>
                      <p>
                        Tell us the quantity, packaging, destination, and
                        timeline.
                      </p>
                    </div>
                  </li>
                  <li>
                    <span>03</span>
                    <div>
                      <h3>Continue directly</h3>
                      <p>We respond with the next practical sourcing step.</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </Container>
        </section>
      </SectionReveal>

      <SectionReveal>
        <DemoReviewPreview />
      </SectionReveal>

      <SectionReveal delay="short">
        <section className="dark-band py-5" aria-labelledby="enquiry-heading">
          <Container className="row align-items-center g-4 mx-auto">
            <div className="col-lg-8">
              <p className="section-label text-warning">
                Tell us what you need
              </p>
              <h2 id="enquiry-heading">
                Send the specifications. We’ll take it from there.
              </h2>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link className="btn btn-warning btn-lg" href="/request-a-quote">
                Start an enquiry
              </Link>
            </div>
          </Container>
        </section>
      </SectionReveal>
    </main>
  );
}
