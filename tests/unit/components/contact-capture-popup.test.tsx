import { ContactCapturePopup } from '@/components/leads/contact-capture-popup';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';

describe('ContactCapturePopup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
  });

  it('makes consent explicit before a buyer can join updates', () => {
    render(<ContactCapturePopup />);

    act(() => vi.advanceTimersByTime(1800));

    expect(
      screen.getByRole('dialog', { name: /keep your supply desk informed/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /agree to be contacted/i }),
    ).not.toBeChecked();
    expect(
      screen.getByRole('button', { name: /send my contact/i }),
    ).toBeDisabled();

    vi.useRealTimers();
  });
});
