import { CompanyPageContentForm } from '@/components/content/website-content-forms';
import { requireOwnerPageSession } from '@/features/auth/server/session';
import { getWebsiteContent } from '@/features/content/server/site-content';
import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import CardBody from 'react-bootstrap/CardBody';

export default async function CompanyPageContentPage() {
  await requireOwnerPageSession();
  const { companyPageContent } = await getWebsiteContent();

  return (
    <>
      <Link className="btn btn-link mb-3 px-0" href="/admin/content">
        <span aria-hidden="true">← </span>Website content
      </Link>
      <section className="mb-4">
        <p className="mb-2 small text-secondary text-uppercase">Company page</p>
        <h1 className="display-6 fw-semibold mb-2">Company page copy</h1>
        <p className="mb-0 text-secondary">
          Write the public introduction and explain how your team works with
          buyers.
        </p>
      </section>
      <Card className="shadow-sm">
        <CardBody className="p-4 p-md-5">
          <CompanyPageContentForm content={companyPageContent} />
        </CardBody>
      </Card>
    </>
  );
}
