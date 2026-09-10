'use client';

import {
  addProductMedia,
  addProductVideo,
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
    <form action={formAction} encType="multipart/form-data" noValidate>
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

      <Form.Group className="mb-3" controlId="product-image-file">
        <Form.Label>Choose image</Form.Label>
        <Form.Control
          accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
          isInvalid={Boolean(errorFor(state.fieldErrors, 'image'))}
          name="image"
          required
          type="file"
        />
        <Form.Text>
          Upload a JPG, PNG, WebP, or AVIF image up to 10 MB. Uploaded files are
          stored with a private generated filename and become public only as
          this product&apos;s image. A light “Shreenathji Trade Links” watermark
          is applied automatically to product uploads only.
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'image')}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4" controlId="product-image-caption">
        <Form.Label>Variant title shown to buyers</Form.Label>
        <Form.Control
          isInvalid={Boolean(errorFor(state.fieldErrors, 'caption'))}
          maxLength={100}
          name="caption"
          placeholder="e.g. Mill Scale Fe 70"
          required
        />
        <Form.Text>
          Use the specific grade, form, or type in this image. This appears as
          the carousel caption for buyers.
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'caption')}
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

export function ProductVideoForm({ productId }: { productId: string }) {
  const [state, formAction, isPending] = useActionState(
    addProductVideo,
    initialProductMediaFormState,
  );

  return (
    <form action={formAction} encType="multipart/form-data" noValidate>
      <input name="productId" type="hidden" value={productId} />
      <FormNotice state={state} />
      <Form.Group className="mb-3" controlId="product-video-file">
        <Form.Label>Choose product video</Form.Label>
        <Form.Control
          accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska,video/3gpp,.mp4,.mov,.webm,.avi,.mkv,.3gp"
          isInvalid={Boolean(errorFor(state.fieldErrors, 'video'))}
          name="video"
          required
          type="file"
        />
        <Form.Text>
          Upload MP4, MOV, WebM, AVI, MKV, or 3GP up to 250 MB. We convert it to
          iPhone-friendly MP4 and make a poster image automatically.
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'video')}
        </Form.Control.Feedback>
      </Form.Group>
      <MediaTextFields fieldErrors={state.fieldErrors} />
      <Button disabled={isPending} type="submit">
        {isPending ? 'Adding video…' : 'Add product video'}
      </Button>
    </form>
  );
}

function FormNotice({ state }: { state: ProductMediaFormState }) {
  return state.message ? (
    <Alert
      className="mb-3"
      role="alert"
      variant={state.status === 'success' ? 'success' : 'danger'}
    >
      {state.message}
    </Alert>
  ) : null;
}

function MediaTextFields({
  fieldErrors,
}: {
  fieldErrors?: Record<string, string[] | undefined>;
}) {
  return (
    <>
      <Form.Group className="mb-4" controlId="product-media-caption">
        <Form.Label>Variant title shown to buyers</Form.Label>
        <Form.Control
          isInvalid={Boolean(errorFor(fieldErrors, 'caption'))}
          maxLength={100}
          name="caption"
          placeholder="e.g. Mill Scale Fe 70"
          required
        />
        <Form.Control.Feedback type="invalid">
          {errorFor(fieldErrors, 'caption')}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-4" controlId="product-media-alt-text">
        <Form.Label>Media description</Form.Label>
        <Form.Control
          isInvalid={Boolean(errorFor(fieldErrors, 'altText'))}
          maxLength={220}
          name="altText"
          placeholder="e.g. Mill scale material video in a bulk yard"
          required
        />
        <Form.Control.Feedback type="invalid">
          {errorFor(fieldErrors, 'altText')}
        </Form.Control.Feedback>
      </Form.Group>
    </>
  );
}
