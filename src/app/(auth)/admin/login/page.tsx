import { LoginForm } from '@/components/auth/login-form';
import { OwnerAccessShell } from '@/components/auth/owner-access-shell';
import { isInitialOwnerSetupAvailable } from '@/features/auth/server/initial-owner-setup';

export default async function AdminLoginPage() {
  const canCreateInitialOwner = await isInitialOwnerSetupAvailable();

  return (
    <OwnerAccessShell
      description="Use your owner email and password. Your authenticator check keeps this workspace private."
      eyebrow="Owner sign in"
      title="Take control of the supply desk."
    >
      <LoginForm canCreateInitialOwner={canCreateInitialOwner} />
    </OwnerAccessShell>
  );
}
