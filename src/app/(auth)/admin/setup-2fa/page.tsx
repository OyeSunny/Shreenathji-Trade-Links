import { OwnerAccessShell } from '@/components/auth/owner-access-shell';
import { TwoFactorSetupForm } from '@/components/auth/two-factor-setup-form';
import { getOwnerSecurityState } from '@/features/auth/server/owner-security';
import { requireOwnerPageSession } from '@/features/auth/server/session';
import { redirect } from 'next/navigation';

export default async function SetupTwoFactorPage() {
  const owner = await requireOwnerPageSession();
  const security = await getOwnerSecurityState(owner.user.id);

  if (!security.requiresSetup) {
    redirect('/admin');
  }

  return (
    <OwnerAccessShell
      description="Add an authenticator before entering the administration area. This is required for every owner account."
      eyebrow="Required security step"
      title="Protect the control room."
    >
      <TwoFactorSetupForm />
    </OwnerAccessShell>
  );
}
