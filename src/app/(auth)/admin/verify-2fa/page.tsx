import { TwoFactorVerifyForm } from '@/components/auth/two-factor-verify-form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

export default function VerifyTwoFactorPage() {
  return (
    <main className="py-5">
      <Container className="py-md-5" style={{ maxWidth: '30rem' }}>
        <Card body className="shadow-sm">
          <p className="mb-2 text-uppercase text-secondary">Owner access</p>
          <h1 className="h2">Verify your identity</h1>
          <p className="mb-4 text-secondary">
            Enter the current code from your authenticator app to continue.
          </p>
          <TwoFactorVerifyForm />
        </Card>
      </Container>
    </main>
  );
}
