import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import Link from 'next/link';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="py-5">
        <Container className="py-md-5" style={{ maxWidth: '30rem' }}>
          <Card body className="shadow-sm">
            <h1 className="h2">Reset link required</h1>
            <p className="text-secondary">
              Request a new password reset link to continue.
            </p>
            <Link className="btn btn-primary" href="/admin/forgot-password">
              Request a reset link
            </Link>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-5">
      <Container className="py-md-5" style={{ maxWidth: '30rem' }}>
        <Card body className="shadow-sm">
          <p className="mb-2 text-uppercase text-secondary">Owner access</p>
          <h1 className="h2">Choose a new password</h1>
          <p className="mb-4 text-secondary">
            This link can be used once and expires shortly.
          </p>
          <ResetPasswordForm token={token} />
        </Card>
      </Container>
    </main>
  );
}
