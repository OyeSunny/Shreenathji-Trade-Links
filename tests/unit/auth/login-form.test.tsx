import { LoginForm } from '@/components/auth/login-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

const { replace, signInEmail } = vi.hoisted(() => ({
  replace: vi.fn(),
  signInEmail: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: { signIn: { email: signInEmail } },
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides accessible credential controls and a neutral failure message', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'autocomplete',
      'email',
    );
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      'autocomplete',
      'current-password',
    );
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /show password/i }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.getByRole('link', { name: /forgot password/i }),
    ).toHaveAttribute('href', '/admin/forgot-password');
    expect(
      screen.getByRole('link', { name: /create the initial owner account/i }),
    ).toHaveAttribute('href', '/admin/first-time-setup');

    await user.type(screen.getByLabelText(/email/i), 'owner@example.com');
    await user.type(
      screen.getByLabelText(/^password$/i),
      'Correct-Horse-Battery-Staple-92!',
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
    expect(screen.queryByText(/email does not exist/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      'type',
      'text',
    );
    expect(
      screen.getByRole('button', { name: /hide password/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('leaves two-factor navigation to the authenticator client', async () => {
    const user = userEvent.setup();
    signInEmail.mockResolvedValueOnce({
      data: { twoFactorRedirect: true },
      error: null,
    });
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'owner@example.com');
    await user.type(
      screen.getByLabelText(/^password$/i),
      'Correct-Horse-Battery-Staple-92!',
    );
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(signInEmail).toHaveBeenCalledOnce();
    expect(replace).not.toHaveBeenCalled();
  });
});
