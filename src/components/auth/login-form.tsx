'use client';

import { loginSchema } from '@/features/auth/schemas';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export const LoginForm = () => {
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

      <Form.Group className="mb-4" controlId="owner-password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          autoComplete="current-password"
          disabled={isSubmitting}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </Form.Group>

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
    </Form>
  );
};
