import Link from 'next/link';
import type { ReactNode } from 'react';
import Container from 'react-bootstrap/Container';

import { UmamiTracker } from '@/components/analytics/umami-tracker';
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
            <span className="brand-mark__monogram">STL</span>
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
      <footer className="public-footer py-5">
        <Container>
          <div className="row g-4">
            <div className="col-md-4">
              <p className="mb-1 text-uppercase small">
                Shreenathji Trade Links
              </p>
              <p className="mb-0 text-white-50">
                Industrial raw materials for domestic and export enquiries.
              </p>
            </div>
            <div className="col-md-5 text-white-50">
              {businessIdentity.registeredAddress ? (
                <address className="mb-3">
                  <span className="d-block small text-uppercase text-white">
                    Registered address
                  </span>
                  {businessIdentity.registeredAddress}
                </address>
              ) : null}
              {businessIdentity.officeAddress ? (
                <address className="mb-0">
                  <span className="d-block small text-uppercase text-white">
                    Office address
                  </span>
                  {businessIdentity.officeAddress}
                </address>
              ) : null}
            </div>
            <div className="col-md-3 text-md-end">
              <p className="mb-0 text-white-50">
                {businessIdentity.city} ·{' '}
                <Link className="text-white-50" href="/privacy">
                  Privacy
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}
