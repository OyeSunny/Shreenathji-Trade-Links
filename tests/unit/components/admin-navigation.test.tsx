import { AdminNavigation } from '@/components/admin/admin-navigation';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

describe('AdminNavigation', () => {
  it('opens a dismissible mobile workspace menu', async () => {
    const user = userEvent.setup();

    render(<AdminNavigation />);

    const toggle = screen.getByRole('button', { name: /menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('navigation', { name: 'Administration' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /contact leads/i }),
    ).toBeInTheDocument();
    expect(document.body).toHaveClass('admin-menu-open');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.getByRole('button', { name: /menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(document.body).not.toHaveClass('admin-menu-open');
  });
});
