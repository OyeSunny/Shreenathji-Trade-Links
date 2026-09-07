'use client';

import Link from 'next/link';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [localResetUrl, setLocalResetUrl] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);
    setLocalResetUrl(null);

    try {
      const response = await fetch('/api/admin/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as {
        localResetUrl?: string;
      };

      setMessage(
        'If that email belongs to the website owner, a password reset link has been prepared.',
      );
      setLocalResetUrl(result.localResetUrl ?? null);
    } catch {
      setMessage('We could not start a password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form noValidate onSubmit={submit}>
      {message ? <Alert variant="info">{message}</Alert> : null}
      {localResetUrl ? (
        <Alert variant="warning">
          <strong>Local preview only:</strong>{' '}
          <Link href={localResetUrl}>Set a new password</Link>
        </Alert>
      ) : null}
      <Form.Group className="mb-4" controlId="forgot-password-email">
        <Form.Label>Owner email</Form.Label>
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
      <Button className="w-100" disabled={!email || isSubmitting} type="submit">
        {isSubmitting ? 'Preparing reset…' : 'Send reset link'}
      </Button>
      <p className="mb-0 mt-3 text-center small">
        <Link href="/admin/login">Back to sign in</Link>
      </p>
    </Form>
  );
}
