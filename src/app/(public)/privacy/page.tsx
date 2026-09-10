import type { Metadata } from 'next';
import Container from 'react-bootstrap/Container';

export const metadata: Metadata = {
  title: 'Privacy | Shreenathji Trade Links',
  description: 'How Shreenathji Trade Links handles website analytics.',
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <section className="privacy-page__hero">
        <Container>
          <p className="section-label mb-3">Privacy</p>
          <div className="privacy-page__hero-grid">
            <h1>A clear view of website activity.</h1>
            <p>
              We collect only what helps us understand site performance and
              respond to genuine business enquiries.
            </p>
          </div>
        </Container>
      </section>
      <section className="privacy-page__content">
        <Container>
          <div className="privacy-page__grid">
            <aside className="privacy-page__summary">
              <span>In short</span>
              <strong>Your enquiry stays with our team.</strong>
              <p>We do not sell visitor or buyer information.</p>
            </aside>
            <div className="privacy-page__details">
              <article>
                <span>01</span>
                <div>
                  <h2>Website analytics</h2>
                  <p>
                    We use privacy-focused analytics to understand useful pages,
                    visitor sources, and broad country, device, and browser
                    patterns.
                  </p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <h2>Enquiries and contact details</h2>
                  <p>
                    Your name, email, phone, WhatsApp number, and request
                    details are used only to respond to your enquiry and manage
                    that business conversation.
                  </p>
                </div>
              </article>
              <article>
                <span>03</span>
                <div>
                  <h2>No advertising profiles</h2>
                  <p>
                    We do not sell visitor information or use your details to
                    create advertising profiles across other websites.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
