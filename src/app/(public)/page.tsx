import Link from 'next/link';
import Container from 'react-bootstrap/Container';

const materialGroups = [
  {
    number: '01',
    name: 'Iron & mill scale',
    description: 'Mill scale, iron ore fines, and lumps for industrial use.',
  },
  {
    number: '02',
    name: 'Carbon materials',
    description: 'Carbon blocks, anthracite, coal fines, and charcoal fines.',
  },
  {
    number: '03',
    name: 'Industrial minerals',
    description: 'Dolomite, melamine, and practical sourcing support.',
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero-section" aria-labelledby="home-title">
        <Container className="position-relative py-5 py-lg-6">
          <div className="hero-section__content">
            <div>
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
            </div>
            <aside
              className="hero-section__specimen"
              aria-label="Material categories"
            >
              <span>01 / FERROUS</span>
              <span>02 / CARBON</span>
              <span>03 / MINERALS</span>
              <strong>STL</strong>
            </aside>
          </div>
          <div className="hero-section__grid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </Container>
      </section>

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

      <section className="py-5 py-lg-6" aria-labelledby="materials-heading">
        <Container>
          <div className="d-lg-flex justify-content-between mb-4 mb-lg-5">
            <div>
              <p className="section-label">What we source</p>
              <h2 id="materials-heading">
                Materials that keep industry moving.
              </h2>
            </div>
            <Link className="align-self-end link-arrow" href="/products">
              View all products <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="row g-3">
            {materialGroups.map((group) => (
              <div className="col-md-4" key={group.number}>
                <article className="material-card h-100 p-4">
                  <span className="material-card__number">{group.number}</span>
                  <h3>{group.name}</h3>
                  <p className="mb-0 text-secondary">{group.description}</p>
                </article>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="dark-band py-5" aria-labelledby="enquiry-heading">
        <Container className="row align-items-center g-4 mx-auto">
          <div className="col-lg-8">
            <p className="section-label text-warning">Tell us what you need</p>
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
    </main>
  );
}
