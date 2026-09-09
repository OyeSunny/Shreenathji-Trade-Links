import { AdminMediaImageViewer } from '@/components/admin/admin-media-image-viewer';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('AdminMediaImageViewer', () => {
  it('opens an uploaded image in an inspection viewer', () => {
    render(
      <AdminMediaImageViewer
        alt="Mill scale Fe 70"
        src="/media/uploads/mill-scale.jpg"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View full image' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Image inspection');
    expect(
      within(dialog).getByRole('img', { name: 'Mill scale Fe 70' }),
    ).toHaveAttribute('src', '/media/uploads/mill-scale.jpg');
  });

  it('zooms the inspected image with the zoom controls', () => {
    render(
      <AdminMediaImageViewer
        alt="Mill scale Fe 70"
        src="/media/uploads/mill-scale.jpg"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View full image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));

    expect(
      within(screen.getByRole('dialog')).getByRole('img', {
        name: 'Mill scale Fe 70',
      }),
    ).toHaveStyle('transform: scale(1.25)');
  });
});
