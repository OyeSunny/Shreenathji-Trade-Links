import {
  makeTelephoneLink,
  makeWhatsAppLink,
} from '@/features/content/contact-channels';
import { getWebsiteContent } from '@/features/content/server/site-content';
import Link from 'next/link';
import Container from 'react-bootstrap/Container';

export default async function ContactPage() {
  const { businessIdentity } = await getWebsiteContent();
  const telephoneLink = makeTelephoneLink(businessIdentity.phone);
  const whatsAppLink = makeWhatsAppLink(businessIdentity.whatsApp);

  return (
    <main className="page-shell contact-page">
      <section className="page-hero">
        <Container>
          <div className="page-hero__grid">
            <div>
              <p className="section-label">Contact / 03</p>
              <h1 className="page-hero__title">Start with your requirement.</h1>
            </div>
            <p className="page-hero__lede">
              The fastest route is a quote request with the material,
              specifications, quantity, and destination.
            </p>
          </div>
        </Container>
      </section>
      <section className="contact-page__body">
        <Container>
          <div className="row g-4 g-lg-0 contact-page__grid">
            <div className="col-lg-8 contact-page__enquiry">
              <p className="section-label">Buyer enquiry</p>
              <h2>Domestic supply or export discussion.</h2>
              <p>
                Submit the details needed for a considered response. It gives
                the team a clear starting point before the call or WhatsApp
                conversation.
              </p>
              <Link className="btn btn-primary" href="/request-a-quote">
                Request a quote <span aria-hidden="true">→</span>
              </Link>
              {businessIdentity.email || telephoneLink || whatsAppLink ? (
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {telephoneLink ? (
                    <a className="btn btn-outline-dark" href={telephoneLink}>
                      Call us
                    </a>
                  ) : null}
                  {whatsAppLink ? (
                    <a
                      className="btn btn-outline-dark"
                      href={whatsAppLink}
                      rel="noreferrer"
                      target="_blank"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                  {businessIdentity.email ? (
                    <a
                      className="btn btn-outline-dark"
                      href={`mailto:${businessIdentity.email}`}
                    >
                      Email us
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="col-lg-4 contact-page__location">
              <p className="section-label">Locations</p>
              <p className="contact-page__location-title">
                {businessIdentity.city}
              </p>
              {businessIdentity.registeredAddress ? (
                <div className="mb-3">
                  <p className="mb-1 small text-uppercase">
                    Registered address
                  </p>
                  <p className="mb-0">{businessIdentity.registeredAddress}</p>
                </div>
              ) : null}
              {businessIdentity.officeAddress ? (
                <div className="mb-3">
                  <p className="mb-1 small text-uppercase">Office address</p>
                  <p className="mb-0">{businessIdentity.officeAddress}</p>
                </div>
              ) : null}
              {!businessIdentity.registeredAddress &&
              !businessIdentity.officeAddress ? (
                <p>{businessIdentity.address || 'India'}</p>
              ) : null}
              <div className="contact-page__coordinates">
                <span>Domestic</span>
                <span>Export</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
