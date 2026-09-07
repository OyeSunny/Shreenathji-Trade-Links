import { BusinessIdentityForm } from '@/components/content/website-content-forms';
import { requireOwnerPageSession } from '@/features/auth/server/session';
import { getWebsiteContent } from '@/features/content/server/site-content';
import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';

export default async function CompanyDetailsContentPage() {
  await requireOwnerPageSession();
  const { businessIdentity } = await getWebsiteContent();

  return (
    <>
      <Link className="btn btn-link mb-3 px-0" href="/admin/content">
        <span aria-hidden="true">← </span>Website content
      </Link>
      <section className="mb-4">
        <p className="mb-2 small text-secondary text-uppercase">Identity</p>
        <h1 className="display-6 fw-semibold mb-2">Company details</h1>
        <p className="mb-0 text-secondary">
          The details buyers see and use to contact the business.
        </p>
      </section>
      <Card className="shadow-sm">
        <CardBody className="p-4 p-md-5">
          <BusinessIdentityForm content={businessIdentity} />
        </CardBody>
      </Card>
    </>
  );
}
