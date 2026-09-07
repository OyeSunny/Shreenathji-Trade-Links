import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BuyerFeedbackCarousel } from '@/components/reviews/buyer-feedback-carousel';

const publishedReviews = [
  {
    id: 'review-one',
    reviewerName: 'Aisha Khan',
    companyName: 'Khan Industrial Supplies',
    location: 'Gujarat, India',
    productName: 'Carbon Blocks',
    rating: 5,
    comment:
      'The grade and dispatch conversation was kept precise from the first enquiry.',
    reviewedOn: new Date('2026-09-01'),
    featured: true,
  },
  {
    id: 'review-two',
    reviewerName: 'Rahul Mehta',
    companyName: 'Mehta Metals',
    location: 'Maharashtra, India',
    productName: 'Mill Scale',
    rating: 4,
    comment:
      'We could confirm the quantity and destination before moving forward with supply details.',
    reviewedOn: new Date('2026-08-17'),
    featured: false,
  },
];

describe('BuyerFeedbackCarousel', () => {
  it('shows only owner-approved review content when reviews are available', () => {
    render(<BuyerFeedbackCarousel reviews={publishedReviews} />);

    expect(
      screen.getByRole('heading', { name: /what approved buyers share/i }),
    ).toBeVisible();
    expect(screen.getByText(/published with buyer approval/i)).toBeVisible();
    expect(screen.queryByText(/demo content/i)).not.toBeInTheDocument();
    expect(screen.getByText('Aisha Khan')).toBeVisible();
  });

  it('changes the single feedback stage with its manual next control', async () => {
    const user = userEvent.setup();
    render(<BuyerFeedbackCarousel reviews={publishedReviews} />);

    await user.click(
      screen.getByRole('button', { name: /show next buyer feedback/i }),
    );

    await waitFor(() => {
      expect(screen.getByText('Rahul Mehta')).toBeVisible();
      expect(screen.queryByText('Aisha Khan')).not.toBeInTheDocument();
    });
  });

  it('uses explicitly labelled previews only when no published reviews exist', () => {
    render(<BuyerFeedbackCarousel reviews={[]} />);

    expect(
      screen.getByRole('heading', { name: /buyer feedback preview/i }),
    ).toBeVisible();
    expect(
      screen.getByText('Demo content — replace before publishing'),
    ).toBeVisible();
    expect(screen.getByText('Preview buyer')).toBeVisible();
  });
});
