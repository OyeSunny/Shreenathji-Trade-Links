import { InitialOwnerSetupForm } from '@/components/auth/initial-owner-setup-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

describe('InitialOwnerSetupForm', () => {
  it('explains the setup-code and password requirements before submission', async () => {
    const user = userEvent.setup();
    render(<InitialOwnerSetupForm email="owner@example.com" />);

    const button = screen.getByRole('button', {
      name: /create owner account/i,
    });
    expect(button).toBeEnabled();
    expect(screen.getByText('owner@example.com')).toBeVisible();

    await user.click(button);
    expect(screen.getByRole('alert')).toHaveTextContent(
      /enter the private one-time setup code/i,
    );

    await user.type(
      screen.getByLabelText(/one-time setup code/i),
      'a-32-character-local-only-setup-code',
    );
    await user.type(
      screen.getByLabelText(/^choose a password/i),
      'Correct-Horse-Battery-Staple-92!',
    );
    await user.type(
      screen.getByLabelText(/^confirm password$/i),
      'Correct-Horse-Battery-Staple-92!',
    );

    expect(button).toBeEnabled();
  });
});
