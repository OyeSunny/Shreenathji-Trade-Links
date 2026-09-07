import { OwnerAccessShell } from '@/components/auth/owner-access-shell';
import { TwoFactorVerifyForm } from '@/components/auth/two-factor-verify-form';

export default function VerifyTwoFactorPage() {
  return (
    <OwnerAccessShell
      description="Enter the current six-digit code from your authenticator app to enter the owner workspace."
      eyebrow="Identity verification"
      title="Confirm it’s you."
    >
      <TwoFactorVerifyForm />
    </OwnerAccessShell>
  );
}
