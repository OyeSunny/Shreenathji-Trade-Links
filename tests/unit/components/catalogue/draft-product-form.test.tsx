import { DraftProductForm } from '@/components/catalogue/draft-product-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('@/app/admin/catalogue/actions', () => ({
  createProductDraft: vi.fn(),
  updateProduct: vi.fn(),
}));

describe('DraftProductForm price display', () => {
  it('defaults the price unit to MT and enables indicative fields when selected', async () => {
    const user = userEvent.setup();
    render(<DraftProductForm />);

    expect(screen.getByLabelText(/^price per$/i)).toHaveValue('MT');
    expect(screen.getByLabelText(/^indicative price$/i)).toBeDisabled();

    await user.selectOptions(
      screen.getByLabelText(/display price on the public catalogue/i),
      'INDICATIVE_PRICE',
    );

    expect(screen.getByLabelText(/^indicative price$/i)).toBeEnabled();
    expect(screen.getByLabelText(/^price per$/i)).toHaveValue('MT');
  });

  it('shows a clear toast and focuses the first missing required field', async () => {
    const user = userEvent.setup();
    render(<DraftProductForm />);

    await user.click(
      screen.getByRole('button', { name: /save draft product/i }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Category name is empty. Please complete it before saving.',
    );
    expect(screen.getByLabelText(/^category name$/i)).toHaveFocus();
  });
});
