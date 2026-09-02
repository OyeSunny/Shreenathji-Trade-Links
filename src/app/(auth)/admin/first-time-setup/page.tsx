import { InitialOwnerSetupForm } from '@/components/auth/initial-owner-setup-form';
import { isInitialOwnerSetupAvailable } from '@/features/auth/server/initial-owner-setup';
import { env } from '@/lib/env';
import { redirect } from 'next/navigation';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

export default async function FirstTimeSetupPage() {
  if (!(await isInitialOwnerSetupAvailable())) {
    redirect('/admin/login');
  }

  return (
    <main className="py-5">
      <Container className="py-md-5" style={{ maxWidth: '34rem' }}>
        <Card body className="shadow-sm">
          <p className="mb-2 text-uppercase text-secondary">One-time setup</p>
          <h1 className="h2">Create the owner account</h1>
          <p className="mb-4 text-secondary">
            This is available only while no owner account exists. The setup code
            comes from the server settings and is never stored in the database.
          </p>
          <InitialOwnerSetupForm email={env.OWNER_EMAIL} />
        </Card>
      </Container>
    </main>
  );
}
