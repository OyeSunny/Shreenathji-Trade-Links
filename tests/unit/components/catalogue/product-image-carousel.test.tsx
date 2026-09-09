import { ProductImageCarousel } from '@/components/catalogue/product-image-carousel';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const images = [
  {
    src: '/media/mill-scale-a.png',
    alt: 'Mill scale in a bulk yard',
    caption: 'Mill Scale Fe 70',
  },
  { src: '/media/mill-scale-b.png', alt: 'Mill scale close-up' },
  { src: '/media/mill-scale-c.png', alt: 'Mill scale ready for dispatch' },
];

describe('ProductImageCarousel', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a plain image when there is exactly one product image', () => {
    render(<ProductImageCarousel images={[images[0]]} />);

    expect(
      screen.getByRole('img', { name: /mill scale in a bulk yard/i }),
    ).toHaveAttribute('src', images[0].src);
    expect(screen.getByText('Shreenathji Trade Links')).toBeInTheDocument();
    expect(screen.getByText('Mill Scale Fe 70')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('lets buyers switch product images manually and advances automatically', () => {
    vi.useFakeTimers();
    render(<ProductImageCarousel images={images} />);

    expect(
      screen.getByRole('button', { name: 'Show image 1' }),
    ).toHaveAttribute('aria-current', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(
      screen.getByRole('button', { name: 'Show image 2' }),
    ).toHaveAttribute('aria-current', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(
      screen.getByRole('button', { name: 'Show image 1' }),
    ).toHaveAttribute('aria-current', 'true');

    act(() => {
      vi.advanceTimersByTime(5500);
    });
    expect(
      screen.getByRole('button', { name: 'Show image 2' }),
    ).toHaveAttribute('aria-current', 'true');
  });
});
