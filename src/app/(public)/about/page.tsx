import Link from 'next/link';
import Container from 'react-bootstrap/Container';

export default function AboutPage() {
  return (
    <main>
      <section
        className="py-5 py-lg-6"
        style={{ background: 'var(--stl-paper)' }}
      >
        <Container>
          <p className="section-label">Company profile</p>
          <h1 className="display-4 fw-semibold" style={{ maxWidth: '14ch' }}>
            Practical sourcing for industrial material buyers.
          </h1>
          <p
            className="fs-5 lh-lg mb-0 mt-4 text-secondary"
            style={{ maxWidth: '42rem' }}
          >
            Shreenathji Trade Links is a Gandhidham, Gujarat-based B2B trading
            business focused on industrial raw materials and buyer enquiries.
          </p>
        </Container>
      </section>
      <section className="py-5 py-lg-6">
        <Container className="row g-5">
          <div className="col-lg-7">
            <p className="section-label">How we work</p>
            <h2>Clear requirements first.</h2>
            <p className="fs-5 lh-lg text-secondary">
              Buyers share their material grade, quantity, packaging, and
              delivery requirements. We then take the conversation forward with
              the relevant material information and sourcing next steps.
            </p>
          </div>
          <div className="col-lg-5">
            <div className="about-market-border border-start border-4 h-100 ps-4">
              <p className="section-label">Markets served</p>
              <p className="h4">India and international buyer enquiries</p>
              <p className="mb-0 text-secondary">
                Domestic requirements and export conversations are handled from
                the same enquiry process.
              </p>
            </div>
          </div>
        </Container>
      </section>
      <section className="dark-band py-5">
        <Container className="d-md-flex align-items-center justify-content-between gap-4">
          <div>
            <p className="section-label text-warning">Have a requirement?</p>
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
