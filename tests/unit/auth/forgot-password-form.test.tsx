import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

describe('ForgotPasswordForm', () => {
  it('shows the local reset link returned by the protected reset request', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          localResetUrl: '/admin/reset-password?token=local-reset-token',
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/owner email/i), 'owner@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/request-password-reset',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(
      screen.getByRole('link', { name: /set a new password/i }),
    ).toHaveAttribute('href', '/admin/reset-password?token=local-reset-token');
  });
});
