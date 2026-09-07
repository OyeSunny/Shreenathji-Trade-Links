import Link from 'next/link';
import Container from 'react-bootstrap/Container';

import { getWebsiteContent } from '@/features/content/server/site-content';

export default async function AboutPage() {
  const { companyPageContent } = await getWebsiteContent();

  return (
    <main className="page-shell company-page">
      <section className="page-hero">
        <Container>
          <div className="page-hero__grid">
            <div>
              <p className="section-label">{companyPageContent.eyebrow}</p>
              <h1 className="page-hero__title">{companyPageContent.title}</h1>
            </div>
            <p className="page-hero__lede">{companyPageContent.lede}</p>
          </div>
        </Container>
      </section>
      <section className="company-page__body">
        <Container>
          <div className="row g-4 g-lg-0 company-page__grid">
            <div className="col-lg-7 company-page__approach">
              <p className="section-label">How we work</p>
              <h2>Clear requirements first.</h2>
              <p>{companyPageContent.body}</p>
              <Link className="link-arrow" href="/request-a-quote">
                Send a material brief <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="col-lg-5 company-page__markets">
              <p className="section-label">Markets served</p>
              <p className="company-page__markets-title">
                India and international buyer enquiries.
              </p>
              <p>
                Domestic requirements and export conversations are handled from
                the same enquiry process.
              </p>
              <div className="company-page__marker" aria-hidden="true">
                <span />
                <i />
              </div>
            </div>
          </div>
        </Container>
      </section>
      <section className="dark-band company-page__cta">
        <Container className="d-md-flex align-items-center justify-content-between gap-4">
          <div>
            <p className="section-label text-warning">
              Have a requirement? / 03
            </p>
            <h2 className="mb-0">Tell us the material and quantity.</h2>
          </div>
          <Link
            className="btn btn-warning mt-3 mt-md-0"
            href="/request-a-quote"
          >
            Request a quote
          </Link>
        </Container>
      </section>
    </main>
  );
}
