import { render, screen, within } from '@testing-library/react';

import { DemoReviewPreview } from '@/components/reviews/demo-review-preview';

describe('DemoReviewPreview', () => {
  it('makes all illustrative review content unambiguously visible as demo content', () => {
    render(<DemoReviewPreview />);

    const section = screen.getByRole('region', {
      name: /buyer feedback examples/i,
    });

    expect(within(section).getAllByRole('article')).toHaveLength(3);
    const demoLabels = within(section).getAllByText(
      'Demo content — replace before publishing',
    );
    expect(demoLabels).toHaveLength(4);
    demoLabels.forEach((label) => expect(label).toBeVisible());
  });

  it('uses anonymous, procurement-focused examples rather than customer claims', () => {
    render(<DemoReviewPreview />);

    expect(
      screen.getByText(/grade, quantity, and delivery requirements/i),
    ).toBeVisible();
    expect(screen.getByText(/packing and dispatch details/i)).toBeVisible();
    expect(screen.getByText(/destination and documentation/i)).toBeVisible();
  });
});
