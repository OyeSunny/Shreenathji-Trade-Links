'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export const TwoFactorVerifyForm = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(code) || isSubmitting) return;

    setHasError(false);
    setIsSubmitting(true);

    try {
      const result = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: false,
      });

      if (result.error) {
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
        <Alert role="alert" variant="danger">
          We could not verify that code. Check your authenticator and try again.
        </Alert>
      ) : null}
      <Form.Group className="mb-4" controlId="two-factor-verification-code">
        <Form.Label>Authenticator code</Form.Label>
        <Form.Control
          autoComplete="one-time-code"
          disabled={isSubmitting}
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          pattern="[0-9]{6}"
          required
          value={code}
        />
      </Form.Group>
      <Button
        className="w-100"
        disabled={!/^\d{6}$/.test(code) || isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Verifying…' : 'Continue'}
      </Button>
    </Form>
  );
};
