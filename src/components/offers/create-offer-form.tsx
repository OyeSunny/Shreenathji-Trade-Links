'use client';

import {
  createOffer,
  type OfferFormState,
  updateOffer,
} from '@/app/admin/offers/actions';
import { useActionState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const initialState: OfferFormState = {};

const errorFor = (
  fieldErrors: Record<string, string[] | undefined> | undefined,
  field: string,
) => fieldErrors?.[field]?.[0];

export const CreateOfferForm = ({
  products,
  offer,
}: {
  products: Array<{ id: string; name: string; status: string }>;
  offer?: {
    details: string | null;
    endsAt: string | null;
    id: string;
    productId: string;
    startsAt: string | null;
    summary: string;
    title: string;
  };
}) => {
  const actionToUse = offer ? updateOffer : createOffer;
  const [state, action, isPending] = useActionState(actionToUse, initialState);

  return (
    <form action={action} noValidate>
      {offer ? <input name="offerId" type="hidden" value={offer.id} /> : null}
      {state.message ? <Alert variant="danger">{state.message}</Alert> : null}
      <Form.Group className="mb-3" controlId="offer-product">
        <Form.Label>Product</Form.Label>
        <Form.Select
          defaultValue={offer?.productId ?? ''}
          isInvalid={Boolean(errorFor(state.fieldErrors, 'productId'))}
          name="productId"
          required
        >
          <option disabled value="">
            Select a product
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
              {product.status === 'PUBLISHED' ? '' : ' (not public yet)'}
            </option>
          ))}
        </Form.Select>
        <Form.Text>
          Only an offer linked to a published product can be made public.
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'productId')}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="offer-title">
        <Form.Label>Offer title</Form.Label>
        <Form.Control
          isInvalid={Boolean(errorFor(state.fieldErrors, 'title'))}
          defaultValue={offer?.title ?? ''}
          maxLength={140}
          name="title"
          placeholder="e.g. Limited stock: Mill Scale"
          required
        />
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'title')}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="offer-summary">
        <Form.Label>Buyer-facing summary</Form.Label>
        <Form.Control
          as="textarea"
          defaultValue={offer?.summary ?? ''}
          isInvalid={Boolean(errorFor(state.fieldErrors, 'summary'))}
          maxLength={500}
          name="summary"
          placeholder="Describe the available supply and the conversation you want buyers to start."
          required
          rows={3}
        />
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'summary')}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="offer-details">
        <Form.Label>Further details (optional)</Form.Label>
        <Form.Control
          as="textarea"
          defaultValue={offer?.details ?? ''}
          maxLength={4000}
          name="details"
          rows={5}
        />
        <Form.Text>
          Do not add a price unless it is approved for public display.
        </Form.Text>
      </Form.Group>

      <div className="row g-3 mb-4">
        <Form.Group className="col-md-6" controlId="offer-starts-at">
          <Form.Label>Starts on (optional)</Form.Label>
          <Form.Control
            defaultValue={offer?.startsAt ?? ''}
            name="startsAt"
            type="date"
          />
        </Form.Group>
        <Form.Group className="col-md-6" controlId="offer-ends-at">
          <Form.Label>Ends on (optional)</Form.Label>
          <Form.Control
            defaultValue={offer?.endsAt ?? ''}
            isInvalid={Boolean(errorFor(state.fieldErrors, 'endsAt'))}
            name="endsAt"
            type="date"
          />
          <Form.Control.Feedback type="invalid">
            {errorFor(state.fieldErrors, 'endsAt')}
          </Form.Control.Feedback>
        </Form.Group>
      </div>

      <div className="align-items-center d-flex gap-3 justify-content-between">
        <p className="mb-0 small text-secondary">
          {offer
            ? 'Changes are saved to this offer. Publication stays under your control.'
            : 'This saves as a draft. Review and publish it from the offers list.'}
        </p>
        <Button disabled={isPending} type="submit">
          {isPending
            ? 'Saving…'
            : offer
              ? 'Save offer changes'
              : 'Save draft offer'}
        </Button>
      </div>
    </form>
  );
};
