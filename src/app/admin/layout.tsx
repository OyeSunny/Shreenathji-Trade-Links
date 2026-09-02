import { SignOutButton } from '@/components/auth/sign-out-button';
import { getOwnerSecurityState } from '@/features/auth/server/owner-security';
import { requireOwnerPageSession } from '@/features/auth/server/session';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import Container from 'react-bootstrap/Container';

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const owner = await requireOwnerPageSession();
  const security = await getOwnerSecurityState(owner.user.id);

  if (security.requiresSetup) {
    redirect('/admin/setup-2fa');
  }

  return (
    <main className="py-4 py-md-5">
      <Container>
        <header className="align-items-center border-bottom d-flex justify-content-between mb-4 pb-3">
          <div>
            <p className="mb-1 text-secondary text-uppercase small">
              Owner dashboard
            </p>
            <p className="mb-0 fw-semibold">Shreenathji Trade Links</p>
          </div>
          <SignOutButton />
        </header>
        {children}
      </Container>
    </main>
  );
}
