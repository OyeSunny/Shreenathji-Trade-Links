import Link from 'next/link';
import type { ReactNode } from 'react';
import Container from 'react-bootstrap/Container';

export default function PublicLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <header className="public-header">
        <Container className="align-items-center d-flex justify-content-between py-3">
          <Link className="brand-mark text-decoration-none" href="/">
            <span className="brand-mark__monogram">STL</span>
            <span>
              <strong>Shreenathji</strong>
              <small>Trade Links</small>
            </span>
          </Link>
          <nav aria-label="Main navigation" className="d-none d-md-flex gap-4">
            <Link href="/products">Products</Link>
            <Link href="/about">Company</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <Link
            className="btn btn-sm btn-outline-light"
            href="/request-a-quote"
          >
            Request a quote
          </Link>
        </Container>
      </header>
      {children}
      <footer className="public-footer py-5">
        <Container className="d-md-flex justify-content-between">
          <div>
            <p className="mb-1 text-uppercase small">Shreenathji Trade Links</p>
            <p className="mb-0 text-white-50">
              Industrial raw materials for domestic and export enquiries.
            </p>
          </div>
          <p className="mb-0 mt-3 mt-md-0 text-white-50">
            Gandhidham, Gujarat, India
          </p>
        </Container>
      </footer>
    </>
  );
}
