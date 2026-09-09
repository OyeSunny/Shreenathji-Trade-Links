'use client';

import { ownerPasswordSchema } from '@/features/auth/schemas';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { PasswordInput } from './password-input';

export const InitialOwnerSetupForm = ({ email }: { email: string }) => {
  const router = useRouter();
  const [setupToken, setSetupToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!setupToken) {
      setErrorMessage('Enter the private one-time setup code.');
      return;
    }

    if (!ownerPasswordSchema.safeParse(password).success) {
      setErrorMessage('Choose a password with at least 14 characters.');
      return;
    }

    if (password !== confirmation) {
      setErrorMessage('The password confirmation does not match.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/first-time-setup', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, setupToken }),
      });

      if (!response.ok) {
        setErrorMessage(
          'Setup could not be completed. Check the setup code and try again.',
        );
        return;
      }

      setPassword('');
      setConfirmation('');
      setSetupToken('');
      router.replace('/admin/login?created=1');
    } catch {
      setErrorMessage('Setup could not be completed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      {errorMessage ? (
        <Alert role="alert" variant="danger">
          {errorMessage}
        </Alert>
      ) : null}
      <p className="border rounded bg-light mb-3 p-3 small">
        <span className="d-block text-secondary">Owner email</span>
        <strong>{email}</strong>
      </p>
      <Form.Group className="mb-3" controlId="owner-setup-token">
        <Form.Label>One-time setup code</Form.Label>
        <Form.Control
          autoComplete="off"
          disabled={isSubmitting}
          onChange={(event) => setSetupToken(event.target.value)}
          required
          type="password"
          value={setupToken}
        />
      </Form.Group>
      <div className="mb-3">
        <PasswordInput
          autoComplete="new-password"
          controlId="owner-new-password"
          disabled={isSubmitting}
          hint="Use at least 14 characters."
          label="Choose a password"
          onChange={(event) => setPassword(event.target.value)}
          required
          value={password}
        />
      </div>
      <div className="mb-4">
        <PasswordInput
          autoComplete="new-password"
          controlId="owner-password-confirmation"
          disabled={isSubmitting}
          label="Confirm password"
          onChange={(event) => setConfirmation(event.target.value)}
          required
          value={confirmation}
        />
      </div>
      <Button className="w-100" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Creating owner account…' : 'Create owner account'}
      </Button>
    </Form>
  );
};
