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
    vi.unstubAllGlobals();
  });

  it('renders a plain image when there is exactly one product image', () => {
    render(<ProductImageCarousel images={[images[0]]} />);

    expect(
      screen.getByRole('img', { name: /mill scale in a bulk yard/i }),
    ).toHaveAttribute('src', expect.stringContaining('mill-scale-a.png'));
    expect(screen.getByText('Shreenathji Trade Links')).toBeInTheDocument();
    expect(screen.getByText('Mill Scale Fe 70')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a ready product video only on buyer request', () => {
    render(
      <ProductImageCarousel
        images={[
          {
            alt: 'Mill scale Fe 70 loading demonstration',
            caption: 'Mill Scale Fe 70',
            kind: 'VIDEO',
            posterUrl: '/media/uploads/mill-scale-poster.webp',
            src: '/media/uploads/mill-scale.mp4',
          },
        ]}
      />,
    );

    const video = screen.getByLabelText(/mill scale fe 70 loading/i);
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).toHaveAttribute(
      'poster',
      '/media/uploads/mill-scale-poster.webp',
    );
  });

  it('lets buyers switch product images manually without losing their selection', () => {
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
      screen.getByRole('button', { name: 'Show image 1' }),
    ).toHaveAttribute('aria-current', 'true');
  });

  it('keeps the current image title in a live caption region', () => {
    render(<ProductImageCarousel images={images} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));

    expect(screen.getByRole('status')).toHaveTextContent('Image 2 of 3');
  });

  it('pauses automatic rotation after a buyer navigates manually and can resume it', () => {
    vi.useFakeTimers();
    render(<ProductImageCarousel images={images} />);

    expect(
      screen.getByRole('button', { name: 'Pause automatic image rotation' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(
      screen.getByRole('button', { name: 'Resume automatic image rotation' }),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5500);
    });
    expect(
      screen.getByRole('button', { name: 'Show image 2' }),
    ).toHaveAttribute('aria-current', 'true');

    fireEvent.click(
      screen.getByRole('button', { name: 'Resume automatic image rotation' }),
    );
    act(() => {
      vi.advanceTimersByTime(5500);
    });
    expect(
      screen.getByRole('button', { name: 'Show image 3' }),
    ).toHaveAttribute('aria-current', 'true');
  });

  it('does not auto-advance when reduced motion is requested', () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: true,
        removeEventListener: vi.fn(),
      }),
    );

    render(<ProductImageCarousel images={images} />);

    act(() => {
      vi.advanceTimersByTime(5500);
    });

    expect(
      screen.getByRole('button', { name: 'Show image 1' }),
    ).toHaveAttribute('aria-current', 'true');
  });
});
