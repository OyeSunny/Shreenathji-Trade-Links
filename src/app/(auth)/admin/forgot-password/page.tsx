import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

export default function ForgotPasswordPage() {
  return (
    <main className="py-5">
      <Container className="py-md-5" style={{ maxWidth: '30rem' }}>
        <Card body className="shadow-sm">
          <p className="mb-2 text-uppercase text-secondary">Owner access</p>
          <h1 className="h2">Reset your password</h1>
          <p className="mb-4 text-secondary">
            Enter the owner email to receive a single-use password reset link.
          </p>
          <ForgotPasswordForm />
        </Card>
      </Container>
    </main>
  );
}
