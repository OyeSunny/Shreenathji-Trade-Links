import { ManagedImage } from '@/components/media/managed-image';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({
    alt,
    className,
    priority,
    sizes,
    src,
  }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={String(alt)}
      className={String(className)}
      data-priority={String(Boolean(priority))}
      data-sizes={String(sizes)}
      src={String(src)}
    />
  ),
}));

describe('ManagedImage', () => {
  it('uses the optimized local image path with its real alt text and sizes', () => {
    render(
      <ManagedImage
        alt="Mill scale in a bulk yard"
        className="material-image"
        priority
        sizes="(max-width: 575px) 86vw, 33vw"
        src="/media/uploads/mill-scale.webp"
      />,
    );

    const image = screen.getByRole('img', {
      name: 'Mill scale in a bulk yard',
    });

    expect(image).toHaveAttribute('src', '/media/uploads/mill-scale.webp');
    expect(image).toHaveAttribute('data-priority', 'true');
    expect(image).toHaveAttribute(
      'data-sizes',
      '(max-width: 575px) 86vw, 33vw',
    );
  });

  it('keeps approved legacy external media lazy and decodes it asynchronously', () => {
    render(
      <ManagedImage
        alt="Approved legacy material image"
        className="material-image"
        sizes="100vw"
        src="https://example.com/material.jpg"
      />,
    );

    const image = screen.getByRole('img', {
      name: 'Approved legacy material image',
    });

    expect(image).toHaveAttribute('src', 'https://example.com/material.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
  });

  it('prioritizes an approved external image when it is the visible hero image', () => {
    render(
      <ManagedImage
        alt="Visible hero material"
        priority
        sizes="100vw"
        src="https://example.com/hero.jpg"
      />,
    );

    const image = screen.getByRole('img', { name: 'Visible hero material' });

    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('fetchpriority', 'high');
  });
});
