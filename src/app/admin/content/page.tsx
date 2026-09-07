import { requireOwnerPageSession } from '@/features/auth/server/session';
import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';

export default async function WebsiteContentPage() {
  await requireOwnerPageSession();

  return (
    <>
      <section className="mb-5">
        <p className="mb-2 small text-secondary text-uppercase">
          Website content
        </p>
        <h1 className="display-6 fw-semibold mb-2">
          Update company information
        </h1>
        <p className="col-lg-8 mb-0 text-secondary">
          Choose the part of the public website you want to manage. Catalogue,
          offers, reviews, enquiries, and buyer contacts have their own areas in
          the workspace.
        </p>
      </section>

      <div className="row g-4">
        {[
          {
            href: '/admin/content/homepage',
            number: '01',
            title: 'Homepage',
            detail:
              'Hero slides, uploaded images, marquee, highlights, catalogue introduction, process, and final call to action.',
            action: 'Manage homepage',
          },
          {
            href: '/admin/content/company-details',
            number: '02',
            title: 'Company details',
            detail:
              'Business name, location, enquiry email, call number, WhatsApp number, and export availability note.',
            action: 'Manage details',
          },
          {
            href: '/admin/content/company-page',
            number: '03',
            title: 'Company page',
            detail:
              'The buyer-facing Company page introduction and working approach.',
            action: 'Manage company page',
          },
        ].map((area) => (
          <div className="col-md-6 col-xl-4" key={area.href}>
            <Card className="admin-content-area h-100 shadow-sm">
              <CardBody className="d-flex flex-column p-4">
                <span className="admin-content-area__number">
                  {area.number}
                </span>
                <h2 className="h3 mt-4">{area.title}</h2>
                <p className="mb-4 text-secondary">{area.detail}</p>
                <Link
                  className="admin-content-area__link mt-auto"
                  href={area.href}
                >
                  {area.action} <span aria-hidden="true">↗</span>
                </Link>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
