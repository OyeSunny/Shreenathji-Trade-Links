import type { Metadata } from 'next';
import Container from 'react-bootstrap/Container';

export const metadata: Metadata = {
  title: 'Privacy | Shreenathji Trade Links',
  description: 'How Shreenathji Trade Links handles website analytics.',
};

export default function PrivacyPage() {
  return (
    <main className="py-5">
      <Container className="content-page">
        <p className="section-eyebrow">Privacy</p>
        <h1 className="display-heading">A clear view of website activity.</h1>
        <div className="content-page__copy mt-4">
          <p>
            We use privacy-focused analytics to understand which pages are
            useful, where visitors arrive from, and the broad country, device,
            and browser patterns behind visits.
          </p>
          <p>
            Our analytics do not receive the name, email address, phone number,
            WhatsApp number, or request details that you enter into an enquiry
            or contact form. Those details are handled only to respond to your
            request.
          </p>
          <p>
            We do not sell visitor information or use analytics to create
            advertising profiles across other websites.
          </p>
        </div>
      </Container>
    </main>
  );
}
