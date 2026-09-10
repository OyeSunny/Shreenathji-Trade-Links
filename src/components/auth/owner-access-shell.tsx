import Link from 'next/link';
import type { ReactNode } from 'react';

import { CompanyLogo } from '@/components/layout/company-logo';

type OwnerAccessShellProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

const OwnerAccessBrand = ({ className }: { className?: string }) => (
  <Link
    aria-label="Back to Shreenathji Trade Links homepage"
    className={className}
    href="/"
  >
    <CompanyLogo className="owner-access__logo" />
    <span>
      <strong>Shreenathji</strong>
      <small>Trade Links</small>
    </span>
  </Link>
);

export function OwnerAccessShell({
  children,
  description,
  eyebrow,
  title,
}: OwnerAccessShellProps) {
  return (
    <main className="owner-access">
      <div aria-hidden="true" className="owner-access__grid" />
      <div className="owner-access__frame">
        <section className="owner-access__manifesto">
          <OwnerAccessBrand className="owner-access__brand" />

          <div className="owner-access__manifesto-copy">
            <p className="owner-access__kicker">
              Owner workspace / secure access
            </p>
            <h2>Keep every material conversation moving.</h2>
            <p>
              A private control room for the catalogue, buyer enquiries, offers,
              and the details that keep your public website current.
            </p>
          </div>

          <div
            className="owner-access__signal-grid"
            aria-label="Workspace capabilities"
          >
            <span>
              <i aria-hidden="true" className="bi bi-box-seam" /> Catalogue
            </span>
            <span>
              <i aria-hidden="true" className="bi bi-chat-square-text" />{' '}
              Enquiries
            </span>
            <span>
              <i aria-hidden="true" className="bi bi-shield-check" /> Protected
            </span>
          </div>

          <p className="owner-access__manifesto-foot">
            <span aria-hidden="true" /> Single-owner access · Two-factor
            protected
          </p>
        </section>

        <section className="owner-access__entry">
          <div className="owner-access__mobile-header">
            <OwnerAccessBrand className="owner-access__brand" />
            <Link className="owner-access__back" href="/">
              <i aria-hidden="true" className="bi bi-arrow-up-right" /> Site
            </Link>
          </div>
          <Link
            className="owner-access__back owner-access__back--desktop"
            href="/"
          >
            <i aria-hidden="true" className="bi bi-arrow-up-right" /> View
            public website
          </Link>

          <div className="owner-access__card">
            <div className="owner-access__card-index" aria-hidden="true">
              01
            </div>
            <p className="owner-access__eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="owner-access__description">{description}</p>
            <div className="owner-access__rule" aria-hidden="true" />
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
