import HomePage from '@/app/(public)/page';
import { render, screen } from '@testing-library/react';

describe('HomePage', () => {
  it('identifies the business and primary enquiry action', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', {
        name: /material supply, made dependable/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /request a quote/i }),
    ).toHaveAttribute('href', '/request-a-quote');
  });
});
