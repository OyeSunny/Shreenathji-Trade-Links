import { InitialOwnerSetupForm } from '@/components/auth/initial-owner-setup-form';
import { OwnerAccessShell } from '@/components/auth/owner-access-shell';
import { isInitialOwnerSetupAvailable } from '@/features/auth/server/initial-owner-setup';
import { env } from '@/lib/env';
import { redirect } from 'next/navigation';

export default async function FirstTimeSetupPage() {
  if (!(await isInitialOwnerSetupAvailable())) {
    redirect('/admin/login');
  }

  return (
    <OwnerAccessShell
      description="This protected step is available only before the first owner account is created."
      eyebrow="One-time workspace setup"
      title="Create the owner account."
    >
      <InitialOwnerSetupForm email={env.OWNER_EMAIL} />
    </OwnerAccessShell>
  );
}
