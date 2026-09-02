import { LoginForm } from '@/components/auth/login-form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';

export default function AdminLoginPage() {
  return (
    <main className="py-5">
      <Container className="py-md-5" style={{ maxWidth: '30rem' }}>
        <Card body className="shadow-sm">
          <p className="mb-2 text-uppercase text-secondary">Owner access</p>
          <h1 className="h2">Sign in to manage the website</h1>
          <p className="mb-4 text-secondary">
            Use your owner email, password, and authenticator verification to
            continue.
          </p>
          <LoginForm />
        </Card>
      </Container>
    </main>
  );
}
