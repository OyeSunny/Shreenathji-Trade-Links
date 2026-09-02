import { InitialOwnerSetupForm } from '@/components/auth/initial-owner-setup-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

describe('InitialOwnerSetupForm', () => {
  it('requires the setup code and a confirmed strong password', async () => {
    const user = userEvent.setup();
    render(<InitialOwnerSetupForm email="owner@example.com" />);

    const button = screen.getByRole('button', {
      name: /create owner account/i,
    });
    expect(button).toBeDisabled();
    expect(screen.getByText('owner@example.com')).toBeVisible();

    await user.type(
      screen.getByLabelText(/one-time setup code/i),
      'a-32-character-local-only-setup-code',
    );
    await user.type(
      screen.getByLabelText(/^choose a password/i),
      'Correct-Horse-Battery-Staple-92!',
    );
    await user.type(
      screen.getByLabelText(/confirm password/i),
      'Correct-Horse-Battery-Staple-92!',
    );

    expect(button).toBeEnabled();
  });
});
