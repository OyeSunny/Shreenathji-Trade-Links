import Link from 'next/link';
import Container from 'react-bootstrap/Container';

export default function ContactPage() {
  return (
    <main className="py-5 py-lg-6">
      <Container style={{ maxWidth: '54rem' }}>
        <p className="section-label">Contact</p>
        <h1 className="display-5 fw-semibold">Start with your requirement.</h1>
        <p
          className="fs-5 lh-lg mb-5 text-secondary"
          style={{ maxWidth: '42rem' }}
        >
          The fastest way to reach the team is to send a quote request with the
          material, specifications, quantity, and destination.
        </p>
        <div className="row g-4">
          <div className="col-md-7">
            <div className="border h-100 p-4 p-md-5">
              <h2 className="h3">Buyer enquiry</h2>
              <p className="text-secondary">
                For domestic supply or export discussions, submit the details
                needed for a considered response.
              </p>
              <Link className="btn btn-primary" href="/request-a-quote">
                Request a quote
              </Link>
            </div>
          </div>
          <div className="col-md-5">
            <div className="h-100 p-4" style={{ background: '#e9e3d6' }}>
              <p className="section-label">Location</p>
              <p className="h4">Gandhidham, Gujarat</p>
              <p className="mb-0 text-secondary">India</p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
