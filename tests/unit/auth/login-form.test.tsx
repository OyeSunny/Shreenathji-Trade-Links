import { LoginForm } from '@/components/auth/login-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

describe('LoginForm', () => {
  it('provides accessible credential controls and a neutral failure message', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'autocomplete',
      'email',
    );
    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      'autocomplete',
      'current-password',
    );
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    expect(
      screen.getByRole('link', { name: /forgot password/i }),
    ).toHaveAttribute('href', '/admin/forgot-password');
    expect(
      screen.getByRole('link', { name: /create the initial owner account/i }),
    ).toHaveAttribute('href', '/admin/first-time-setup');

    await user.type(screen.getByLabelText(/email/i), 'owner@example.com');
    await user.type(
      screen.getByLabelText(/password/i),
      'Correct-Horse-Battery-Staple-92!',
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
    expect(screen.queryByText(/email does not exist/i)).not.toBeInTheDocument();
  });
});
