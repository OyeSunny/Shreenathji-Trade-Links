import { TwoFactorSetupForm } from '@/components/auth/two-factor-setup-form';
import { getOwnerSecurityState } from '@/features/auth/server/owner-security';
import { requireOwnerPageSession } from '@/features/auth/server/session';
import { redirect } from 'next/navigation';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

export default async function SetupTwoFactorPage() {
  const owner = await requireOwnerPageSession();
  const security = await getOwnerSecurityState(owner.user.id);

  if (!security.requiresSetup) {
    redirect('/admin');
  }

  return (
    <main className="py-5">
      <Container className="py-md-5" style={{ maxWidth: '34rem' }}>
        <Card body className="shadow-sm">
          <p className="mb-2 text-uppercase text-secondary">
            Required security step
          </p>
          <h1 className="h2">Protect owner access</h1>
          <p className="mb-4 text-secondary">
            Add an authenticator before using the website administration area.
          </p>
          <TwoFactorSetupForm />
        </Card>
      </Container>
    </main>
  );
}
