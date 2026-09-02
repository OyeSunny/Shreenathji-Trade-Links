'use client';

import {
  addProductMedia,
  type ProductMediaFormState,
} from '@/app/admin/catalogue/actions';
import { useActionState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const initialProductMediaFormState: ProductMediaFormState = {};

const errorFor = (
  fieldErrors: Record<string, string[] | undefined> | undefined,
  field: string,
) => fieldErrors?.[field]?.[0];

export function ProductMediaForm({ productId }: { productId: string }) {
  const [state, formAction, isPending] = useActionState(
    addProductMedia,
    initialProductMediaFormState,
  );

  return (
    <form action={formAction} noValidate>
      <input name="productId" type="hidden" value={productId} />

      {state.message ? (
        <Alert
          className="mb-3"
          role="alert"
          variant={state.status === 'success' ? 'success' : 'danger'}
        >
          {state.message}
        </Alert>
      ) : null}

      <Form.Group className="mb-3" controlId="product-image-url">
        <Form.Label>Image URL</Form.Label>
        <Form.Control
          autoComplete="url"
          isInvalid={Boolean(errorFor(state.fieldErrors, 'imageUrl'))}
          maxLength={2048}
          name="imageUrl"
          placeholder="/media/product-image.png or https://…"
          required
          type="url"
        />
        <Form.Text>
          Project images under <code>/media/</code> can be shown publicly at
          once. HTTPS images are stored as private drafts until image rights are
          verified.
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'imageUrl')}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4" controlId="product-image-alt-text">
        <Form.Label>Image description</Form.Label>
        <Form.Control
          isInvalid={Boolean(errorFor(state.fieldErrors, 'altText'))}
          maxLength={220}
          name="altText"
          placeholder="e.g. Mill scale stored in a covered bulk yard"
          required
        />
        <Form.Text>
          This is read by screen readers and helps buyers understand the image.
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'altText')}
        </Form.Control.Feedback>
      </Form.Group>

      <Button disabled={isPending} type="submit">
        {isPending ? 'Adding image…' : 'Add carousel image'}
      </Button>
    </form>
  );
}
