import { OwnerAccessShell } from '@/components/auth/owner-access-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import Link from 'next/link';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <OwnerAccessShell
        description="Password links are single-use. Request a new one and we will send it to the owner email."
        eyebrow="Password recovery"
        title="A fresh reset link is needed."
      >
        <Link className="btn btn-primary w-100" href="/admin/forgot-password">
          Request a reset link{' '}
          <i aria-hidden="true" className="bi bi-arrow-right" />
        </Link>
      </OwnerAccessShell>
    );
  }

  return (
    <OwnerAccessShell
      description="Choose a strong new password. This link is single-use and expires shortly."
      eyebrow="Password recovery"
      title="Set a new owner password."
    >
      <ResetPasswordForm token={token} />
    </OwnerAccessShell>
  );
}
