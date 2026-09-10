import HomePage from '@/app/(public)/page';
import { defaultHomePageContent } from '@/features/content/site-content';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const getPublishedProducts = vi.hoisted(() => vi.fn());
const getPublishedCustomerReviews = vi.hoisted(() => vi.fn());
const getWebsiteContent = vi.hoisted(() => vi.fn());

vi.mock('@/features/catalogue/server/public-catalogue', () => ({
  getPublishedProducts,
  getPublicImageUrl: () => '/media/test-product.png',
}));

vi.mock('@/features/reviews/server/public-reviews', () => ({
  getPublishedCustomerReviews,
}));

vi.mock('@/features/content/server/site-content', () => ({
  getWebsiteContent,
}));

const product = {
  id: 'product_1',
  name: 'Mill Scale',
  slug: 'mill-scale',
  summary: 'Ferrous oxide scale for industrial material requirements.',
  category: { name: 'Iron & mill scale', slug: 'iron-mill-scale' },
  media: [
    {
      altText: 'Mill scale material',
      media: {
        altText: 'Mill scale material',
        sourceUrl: '/media/test-product.png',
        storageKey: 'test-product',
      },
    },
  ],
};

describe('HomePage', () => {
  beforeEach(() => {
    getPublishedProducts.mockResolvedValue([product]);
    getPublishedCustomerReviews.mockResolvedValue([]);
    getWebsiteContent.mockResolvedValue({
      homePageContent: defaultHomePageContent,
    });
  });

  it('identifies the business and primary enquiry action', async () => {
    render(await HomePage());
    expect(
      screen.getByRole('heading', {
        name: /material supply, made dependable/i,
      }),
    ).toBeVisible();
    expect(
      screen.getAllByRole('link', { name: /request a quote/i })[0],
    ).toHaveAttribute('href', '/request-a-quote');
  });

  it('introduces every material chapter with a hero image', async () => {
    render(await HomePage());

    expect(document.querySelectorAll('.hero-slide__image')).toHaveLength(5);
  });

  it('shows published catalogue materials on the home page', async () => {
    render(await HomePage());

    expect(
      screen.getByRole('heading', { name: /materials ready to quote/i }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /view mill scale/i }),
    ).toHaveAttribute('href', '/products/mill-scale');
  });

  it('groups featured materials into the mobile scroll rail', async () => {
    render(await HomePage());

    expect(
      screen.getByRole('list', { name: /featured materials/i }),
    ).toHaveClass('home-product-rail');
    expect(screen.getByText(/swipe to explore/i)).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
