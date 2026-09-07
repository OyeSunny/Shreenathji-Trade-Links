import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { OwnerAccessShell } from '@/components/auth/owner-access-shell';

export default function ForgotPasswordPage() {
  return (
    <OwnerAccessShell
      description="Enter the owner email and we will send a single-use link to restore secure access."
      eyebrow="Password recovery"
      title="Recover owner access."
    >
      <ForgotPasswordForm />
    </OwnerAccessShell>
  );
}
