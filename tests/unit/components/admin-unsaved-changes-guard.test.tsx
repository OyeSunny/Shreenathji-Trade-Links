import { AdminUnsavedChangesGuard } from '@/components/admin/admin-unsaved-changes-guard';
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';

function TestPage() {
  return (
    <>
      <AdminUnsavedChangesGuard />
      <form onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="product-name">Product name</label>
        <input defaultValue="Mill Scale" id="product-name" name="name" />
        <button type="submit">Save changes</button>
      </form>
      <a href="/admin/catalogue">Return to catalogue</a>
    </>
  );
}

describe('AdminUnsavedChangesGuard', () => {
  it('asks before leaving after an owner changes a form field', () => {
    render(<TestPage />);

    fireEvent.change(screen.getByLabelText('Product name'), {
      target: { value: 'Mill Scale Fe 70' },
    });
    fireEvent.click(screen.getByRole('link', { name: 'Return to catalogue' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Unsaved changes');
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Leave without saving' }),
    ).toBeVisible();
  });

  it('does not warn after the edited form has been submitted', () => {
    render(<TestPage />);

    fireEvent.change(screen.getByLabelText('Product name'), {
      target: { value: 'Mill Scale Fe 70' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save changes' }));
    const link = screen.getByRole('link', { name: 'Return to catalogue' });
    link.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(link);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks before the browser back button leaves an edited page', async () => {
    render(<TestPage />);

    fireEvent.change(screen.getByLabelText('Product name'), {
      target: { value: 'Mill Scale Fe 70' },
    });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(await screen.findByRole('dialog')).toHaveTextContent(
      'Unsaved changes',
    );
  });

  it('requests browser protection when the owner refreshes with edits', () => {
    render(<TestPage />);

    fireEvent.change(screen.getByLabelText('Product name'), {
      target: { value: 'Mill Scale Fe 70' },
    });
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
