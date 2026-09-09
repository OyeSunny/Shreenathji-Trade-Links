import Link from 'next/link';
import type { ReactNode } from 'react';
import Container from 'react-bootstrap/Container';

import { UmamiTracker } from '@/components/analytics/umami-tracker';
import { PublicNavigation } from '@/components/layout/public-navigation';
import { ContactCapturePopup } from '@/components/leads/contact-capture-popup';

export default function PublicLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
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
        <Container className="d-md-flex justify-content-between">
          <div>
            <p className="mb-1 text-uppercase small">Shreenathji Trade Links</p>
            <p className="mb-0 text-white-50">
              Industrial raw materials for domestic and export enquiries.
            </p>
          </div>
          <p className="mb-0 mt-3 mt-md-0 text-white-50">
            Gandhidham, Gujarat, India ·{' '}
            <Link className="text-white-50" href="/privacy">
              Privacy
            </Link>
          </p>
        </Container>
      </footer>
    </>
  );
}
