import { render } from '@testing-library/react';

import { UmamiTracker } from '@/components/analytics/umami-tracker';

describe('UmamiTracker', () => {
  it('does not render a tracker script without a website id', () => {
    render(<UmamiTracker />);

    expect(document.querySelector('script[data-website-id]')).toBeNull();
  });

  it('renders the configured privacy-focused tracker script', () => {
    render(<UmamiTracker websiteId="website-id" />);

    const script = document.querySelector(
      'script[data-website-id="website-id"]',
    );
    expect(script).toHaveAttribute(
      'src',
      'https://analytics.shreenathjitradelinks.com/script.js',
    );
    expect(script).toHaveAttribute('data-domains', 'shreenathjitradelinks.com');
  });
});
