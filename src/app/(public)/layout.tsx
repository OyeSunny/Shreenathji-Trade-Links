import Link from 'next/link';
import type { ReactNode } from 'react';
import Container from 'react-bootstrap/Container';

import { UmamiTracker } from '@/components/analytics/umami-tracker';
import { CompanyLogo } from '@/components/layout/company-logo';
import { PublicNavigation } from '@/components/layout/public-navigation';
import { ContactCapturePopup } from '@/components/leads/contact-capture-popup';
import { getWebsiteContent } from '@/features/content/server/site-content';

export default async function PublicLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { businessIdentity } = await getWebsiteContent();

  return (
    <>
      <UmamiTracker websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID} />
      <header className="public-header">
        <Container className="align-items-center d-flex justify-content-between py-3">
          <Link className="brand-mark text-decoration-none" href="/">
            <CompanyLogo className="brand-mark__logo" />
            <span>
              <strong>Shreenathji</strong>
              <small>Trade Links</small>
            </span>
          </Link>
          <PublicNavigation />
        </Container>
      </header>
      {children}
      <ContactCapturePopup />
      <footer className="public-footer">
        <Container className="public-footer__inner">
          <div className="public-footer__top">
            <div className="public-footer__intro">
              <CompanyLogo className="public-footer__logo" />
              <div>
                <p className="public-footer__company">
                  Shreenathji Trade Links
                </p>
                <p className="public-footer__statement">
                  Industrial raw materials for domestic and export enquiries.
                </p>
              </div>
            </div>
            <nav
              aria-label="Footer navigation"
              className="public-footer__links"
            >
              <Link href="/products">Products</Link>
              <Link href="/offers">Offers</Link>
              <Link href="/about">Company</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
          </div>
          {(businessIdentity.registeredAddress ||
            businessIdentity.officeAddress) && (
            <div className="public-footer__addresses">
              {businessIdentity.registeredAddress ? (
                <address className="public-footer__address">
                  <span>Registered address</span>
                  <p>{businessIdentity.registeredAddress}</p>
                </address>
              ) : null}
              {businessIdentity.officeAddress ? (
                <address className="public-footer__address">
                  <span>Office address</span>
                  <p>{businessIdentity.officeAddress}</p>
                </address>
              ) : null}
            </div>
          )}
          <p className="public-footer__location">{businessIdentity.city}</p>
        </Container>
      </footer>
    </>
  );
}
