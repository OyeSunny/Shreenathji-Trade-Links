'use client';

import Link from 'next/link';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (password !== confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        setError(
          'This reset link is invalid or has expired. Request a new one.',
        );
        return;
      }

      setComplete(true);
    } catch {
      setError('We could not reset the password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (complete) {
    return (
      <Alert variant="success">
        Password updated. <Link href="/admin/login">Sign in</Link> with your new
        password, then complete your authenticator check.
      </Alert>
    );
  }

  return (
    <Form noValidate onSubmit={submit}>
      {error ? (
        <Alert role="alert" variant="danger">
          {error}
        </Alert>
      ) : null}
      <Form.Group className="mb-3" controlId="new-password">
        <Form.Label>New password</Form.Label>
        <Form.Control
          autoComplete="new-password"
          disabled={isSubmitting}
          minLength={14}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <Form.Text>Use at least 14 characters.</Form.Text>
      </Form.Group>
      <Form.Group className="mb-4" controlId="confirm-new-password">
        <Form.Label>Confirm new password</Form.Label>
        <Form.Control
          autoComplete="new-password"
          disabled={isSubmitting}
          minLength={14}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          type="password"
          value={confirmPassword}
        />
      </Form.Group>
      <Button className="w-100" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Updating password…' : 'Set new password'}
      </Button>
    </Form>
  );
}
