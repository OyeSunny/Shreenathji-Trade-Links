'use client';

import { useState, type ChangeEvent } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

type PasswordInputProps = {
  autoComplete: 'current-password' | 'new-password';
  controlId: string;
  disabled?: boolean;
  hint?: string;
  label: string;
  minLength?: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  value: string;
};

export const PasswordInput = ({
  autoComplete,
  controlId,
  disabled = false,
  hint,
  label,
  minLength,
  onChange,
  required = false,
  value,
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const action = isVisible ? 'Hide' : 'Show';

  return (
    <Form.Group controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <div className="password-input">
        <Form.Control
          autoComplete={autoComplete}
          disabled={disabled}
          minLength={minLength}
          onChange={onChange}
          required={required}
          type={isVisible ? 'text' : 'password'}
          value={value}
        />
        <Button
          aria-label={`${action} ${label.toLowerCase()}`}
          aria-pressed={isVisible}
          className="password-input__toggle"
          disabled={disabled}
          onClick={() => setIsVisible((current) => !current)}
          title={`${action} ${label.toLowerCase()}`}
          type="button"
          variant="link"
        >
          <i
            aria-hidden="true"
            className={isVisible ? 'bi bi-eye-slash' : 'bi bi-eye'}
          />
        </Button>
      </div>
      {hint ? <Form.Text>{hint}</Form.Text> : null}
    </Form.Group>
  );
};
