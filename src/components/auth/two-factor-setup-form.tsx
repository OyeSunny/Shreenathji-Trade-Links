'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

type SetupStep = 'password' | 'verify' | 'recovery';

export const TwoFactorSetupForm = () => {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>('password');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const enableAuthenticator = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!password || isSubmitting) return;

    setHasError(false);
    setIsSubmitting(true);

    try {
      const response = await authClient.twoFactor.enable({
        password,
        method: 'totp',
        issuer: 'Shreenathji Trade Links',
      });

      if (
        response.error ||
        response.data?.method !== 'totp' ||
        !response.data.totpURI
      ) {
        setHasError(true);
        return;
      }

      setPassword('');
      setTotpUri(response.data.totpURI);
      setStep('verify');
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyAuthenticator = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(code) || isSubmitting) return;

    setHasError(false);
    setIsSubmitting(true);

    try {
      const completion = await fetch('/api/admin/complete-2fa', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const result = (await completion.json()) as {
        recoveryCodes?: string[];
      };

      if (!completion.ok || !result.recoveryCodes) {
        setHasError(true);
        return;
      }

      setRecoveryCodes(result.recoveryCodes);
      setStep('recovery');
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'recovery') {
    return (
      <section aria-labelledby="recovery-codes-heading">
        <Alert variant="success">
          Your authenticator is active. Save these recovery codes somewhere
          private before signing in again.
        </Alert>
        <h2 className="h5" id="recovery-codes-heading">
          One-time recovery codes
        </h2>
        <div className="border rounded bg-light p-3">
          <div className="row row-cols-2 g-2 font-monospace">
            {recoveryCodes.map((recoveryCode) => (
              <div className="col" key={recoveryCode}>
                {recoveryCode}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-secondary small">
          They are shown only once. Do not send them by email, WhatsApp, or
          chat.
        </p>
        <Button
          className="w-100"
          onClick={() => router.replace('/admin/login')}
        >
          I have saved my codes — sign in again
        </Button>
      </section>
    );
  }

  return (
    <>
      {hasError ? (
        <Alert role="alert" variant="danger">
          We could not complete this step. Check the information and try again.
        </Alert>
      ) : null}

      {step === 'password' ? (
        <Form noValidate onSubmit={enableAuthenticator}>
          <p className="text-secondary">
            First, confirm your password to protect this security change.
          </p>
          <Form.Group className="mb-4" controlId="two-factor-password">
            <Form.Label>Current password</Form.Label>
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
            disabled={!password || isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Preparing…' : 'Set up authenticator'}
          </Button>
        </Form>
      ) : (
        <Form noValidate onSubmit={verifyAuthenticator}>
          <p className="text-secondary">
            Scan this code in Google Authenticator, Microsoft Authenticator, or
            another TOTP-compatible app, then enter its six-digit code.
          </p>
          {totpUri ? (
            <div className="d-flex justify-content-center mb-4">
              <QRCodeSVG
                bgColor="#ffffff"
                fgColor="#173d37"
                level="M"
                marginSize={2}
                size={224}
                value={totpUri}
              />
            </div>
          ) : null}
          <Form.Group className="mb-4" controlId="totp-code">
            <Form.Label>Authenticator code</Form.Label>
            <Form.Control
              autoComplete="one-time-code"
              disabled={isSubmitting}
              inputMode="numeric"
              maxLength={6}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ''))
              }
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
            {isSubmitting ? 'Verifying…' : 'Verify authenticator'}
          </Button>
        </Form>
      )}
    </>
  );
};
