'use client';

import { loginSchema } from '@/features/auth/schemas';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { PasswordInput } from './password-input';

export const LoginForm = ({
  canCreateInitialOwner = false,
}: {
  canCreateInitialOwner?: boolean;
}) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const canSubmit = loginSchema.safeParse({ email, password }).success;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setHasError(false);

    try {
      const response = await authClient.signIn.email({ email, password });

      if (response.error) {
        setHasError(true);
        return;
      }

      // The two-factor client redirects to its verification screen itself.
      // Navigating to /admin here would race that redirect after the normal
      // session cookie has intentionally been removed.
      const requiresTwoFactor =
        typeof response.data === 'object' &&
        response.data !== null &&
        'twoFactorRedirect' in response.data &&
        response.data.twoFactorRedirect === true;

      if (requiresTwoFactor) return;

      router.replace('/admin');
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      {hasError ? (
        <Alert variant="danger" role="alert">
          We could not sign you in. Check your details and try again.
        </Alert>
      ) : null}

      <Form.Group className="mb-3" controlId="owner-email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          autoComplete="email"
          disabled={isSubmitting}
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </Form.Group>

      <div className="mb-4">
        <PasswordInput
          autoComplete="current-password"
          controlId="owner-password"
          disabled={isSubmitting}
          label="Password"
          onChange={(event) => setPassword(event.target.value)}
          required
          value={password}
        />
      </div>

      <Button
        className="w-100"
        disabled={!canSubmit || isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="mb-0 mt-3 text-center">
        <Link href="/admin/forgot-password">Forgot password?</Link>
      </p>
      {canCreateInitialOwner ? (
        <p className="mb-0 mt-2 text-center small">
          <Link href="/admin/first-time-setup">
            Create the initial owner account
          </Link>
        </p>
      ) : null}
    </Form>
  );
};
