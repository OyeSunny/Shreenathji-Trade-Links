import { RequestQuoteForm } from '@/components/enquiries/request-quote-form';
import Container from 'react-bootstrap/Container';

export default function RequestQuotePage() {
  return (
    <main className="py-5 py-lg-6">
      <Container style={{ maxWidth: '54rem' }}>
        <p className="section-label">Buyer enquiry</p>
        <h1 className="display-5 fw-semibold">
          Let’s discuss your requirement.
        </h1>
        <p className="lead mb-5 text-secondary">
          Share what you need, where it is required, and the estimated quantity.
          Our team will respond with the relevant next steps.
        </p>
        <RequestQuoteForm />
      </Container>
    </main>
  );
}
