'use client';

import {
  createProductDraft,
  type ProductDraftFormState,
  updateProduct,
} from '@/app/admin/catalogue/actions';
import { useActionState, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

const errorFor = (
  fieldErrors: Record<string, string[] | undefined> | undefined,
  field: string,
) => fieldErrors?.[field]?.[0];

const initialProductDraftFormState: ProductDraftFormState = {};

export type ProductFormValues = {
  applications: string[];
  availability:
    'AVAILABLE_ON_REQUEST' | 'IN_STOCK' | 'LIMITED_STOCK' | 'OUT_OF_STOCK';
  categoryName: string;
  description: string | null;
  form: string | null;
  grade: string | null;
  id: string;
  minimumOrderQty: string | null;
  name: string;
  orderUnit: string | null;
  priceVisibility: 'ASK_FOR_PRICE' | 'INDICATIVE_PRICE';
  indicativePrice: string | null;
  currency: string | null;
  priceUnit: string | null;
  summary: string;
};

export const DraftProductForm = ({
  product,
}: {
  product?: ProductFormValues;
}) => {
  const action = product ? updateProduct : createProductDraft;
  const [state, formAction, isPending] = useActionState(
    action,
    initialProductDraftFormState,
  );
  const [priceVisibility, setPriceVisibility] = useState(
    product?.priceVisibility ?? 'ASK_FOR_PRICE',
  );
  const [isPriceVisibilityDirty, setIsPriceVisibilityDirty] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const displayedPriceVisibility = isPriceVisibilityDirty
    ? priceVisibility
    : (state.priceVisibility ?? priceVisibility);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;

    if (form.checkValidity()) {
      setValidationMessage(null);
      return;
    }

    event.preventDefault();
    const invalidField = form.querySelector<HTMLElement>(':invalid');
    const fieldLabel = invalidField?.id
      ? document.querySelector(`label[for="${invalidField.id}"]`)?.textContent
      : null;

    setValidationMessage(
      `${fieldLabel?.trim() || 'A required field'} is empty. Please complete it before saving.`,
    );
    invalidField?.focus();
  };

  return (
    <form action={formAction} noValidate onSubmit={handleSubmit}>
      {product ? (
        <input name="productId" type="hidden" value={product.id} />
      ) : null}
      {state.message ? (
        <Alert role="alert" variant={state.status ?? 'error'}>
          {state.message}
        </Alert>
      ) : null}

      <section className="border-bottom mb-4 pb-4">
        <p className="fw-semibold mb-3 text-uppercase small text-secondary">
          Catalogue grouping
        </p>
        <Form.Group controlId="category-name">
          <Form.Label>Category name</Form.Label>
          <Form.Control
            aria-describedby="category-name-help"
            defaultValue={product?.categoryName ?? ''}
            isInvalid={Boolean(errorFor(state.fieldErrors, 'categoryName'))}
            maxLength={100}
            name="categoryName"
            placeholder="e.g. Iron Ore"
            required
          />
          <Form.Text id="category-name-help">
            An existing category with this name is reused; otherwise a draft
            category is created.
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            {errorFor(state.fieldErrors, 'categoryName')}
          </Form.Control.Feedback>
        </Form.Group>
      </section>

      <section className="border-bottom mb-4 pb-4">
        <p className="fw-semibold mb-3 text-uppercase small text-secondary">
          Product details
        </p>
        <Form.Group className="mb-3" controlId="product-name">
          <Form.Label>Product name</Form.Label>
          <Form.Control
            isInvalid={Boolean(errorFor(state.fieldErrors, 'productName'))}
            maxLength={140}
            name="productName"
            defaultValue={product?.name ?? ''}
            placeholder="e.g. Iron Ore Fines"
            required
          />
          <Form.Control.Feedback type="invalid">
            {errorFor(state.fieldErrors, 'productName')}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="product-summary">
          <Form.Label>Short summary</Form.Label>
          <Form.Control
            as="textarea"
            defaultValue={product?.summary ?? ''}
            isInvalid={Boolean(errorFor(state.fieldErrors, 'summary'))}
            maxLength={500}
            name="summary"
            placeholder="A clear, buyer-facing overview of this material."
            required
            rows={3}
          />
          <Form.Text>
            10–500 characters. This will be used in catalogue cards.
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            {errorFor(state.fieldErrors, 'summary')}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="product-description">
          <Form.Label>
            Detailed description{' '}
            <span className="text-secondary">(optional)</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            defaultValue={product?.description ?? ''}
            isInvalid={Boolean(errorFor(state.fieldErrors, 'description'))}
            maxLength={4000}
            name="description"
            rows={5}
          />
          <Form.Control.Feedback type="invalid">
            {errorFor(state.fieldErrors, 'description')}
          </Form.Control.Feedback>
        </Form.Group>
      </section>

      <section className="border-bottom mb-4 pb-4">
        <p className="fw-semibold mb-3 text-uppercase small text-secondary">
          Supply information
        </p>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group controlId="product-grade">
              <Form.Label>
                Grade <span className="text-secondary">(optional)</span>
              </Form.Label>
              <Form.Control
                maxLength={100}
                name="grade"
                defaultValue={product?.grade ?? ''}
                placeholder="e.g. 60% Fe"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="product-form">
              <Form.Label>
                Form <span className="text-secondary">(optional)</span>
              </Form.Label>
              <Form.Control
                maxLength={100}
                name="form"
                defaultValue={product?.form ?? ''}
                placeholder="e.g. Fines"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="minimum-order-quantity">
              <Form.Label>
                Minimum order quantity{' '}
                <span className="text-secondary">(optional)</span>
              </Form.Label>
              <Form.Control
                inputMode="decimal"
                isInvalid={Boolean(
                  errorFor(state.fieldErrors, 'minimumOrderQty'),
                )}
                maxLength={20}
                name="minimumOrderQty"
                defaultValue={product?.minimumOrderQty ?? ''}
                placeholder="e.g. 25"
              />
              <Form.Control.Feedback type="invalid">
                {errorFor(state.fieldErrors, 'minimumOrderQty')}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="order-unit">
              <Form.Label>
                Order unit <span className="text-secondary">(optional)</span>
              </Form.Label>
              <Form.Control
                isInvalid={Boolean(errorFor(state.fieldErrors, 'orderUnit'))}
                maxLength={25}
                name="orderUnit"
                defaultValue={product?.orderUnit ?? ''}
                placeholder="e.g. MT"
              />
              <Form.Control.Feedback type="invalid">
                {errorFor(state.fieldErrors, 'orderUnit')}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="availability">
              <Form.Label>Availability</Form.Label>
              <Form.Select
                defaultValue={product?.availability ?? 'AVAILABLE_ON_REQUEST'}
                name="availability"
              >
                <option value="AVAILABLE_ON_REQUEST">
                  Available on request
                </option>
                <option value="IN_STOCK">In stock</option>
                <option value="LIMITED_STOCK">Limited stock</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </section>

      <section className="border-bottom mb-4 pb-4">
        <p className="fw-semibold mb-3 text-uppercase small text-secondary">
          Buyer price display
        </p>
        <Form.Group className="mb-3" controlId="price-visibility">
          <Form.Label>Display price on the public catalogue</Form.Label>
          <Form.Select
            name="priceVisibility"
            onChange={(event) => {
              setIsPriceVisibilityDirty(true);
              setPriceVisibility(
                event.target.value as 'ASK_FOR_PRICE' | 'INDICATIVE_PRICE',
              );
            }}
            value={displayedPriceVisibility}
          >
            <option value="ASK_FOR_PRICE">Keep price on request</option>
            <option value="INDICATIVE_PRICE">
              Show an indicative price to buyers
            </option>
          </Form.Select>
          <Form.Text>
            Use an indicative price only when it is commercially approved. The
            final quote can still vary by grade, quantity, delivery, and taxes.
          </Form.Text>
        </Form.Group>
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="indicative-price">
              <Form.Label>Indicative price</Form.Label>
              <Form.Control
                defaultValue={product?.indicativePrice ?? ''}
                disabled={displayedPriceVisibility !== 'INDICATIVE_PRICE'}
                inputMode="decimal"
                isInvalid={Boolean(
                  errorFor(state.fieldErrors, 'indicativePrice'),
                )}
                maxLength={24}
                name="indicativePrice"
                placeholder="e.g. 4250"
                required={displayedPriceVisibility === 'INDICATIVE_PRICE'}
              />
              <Form.Control.Feedback type="invalid">
                {errorFor(state.fieldErrors, 'indicativePrice')}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="price-currency">
              <Form.Label>Currency</Form.Label>
              <Form.Select
                defaultValue={product?.currency ?? 'INR'}
                disabled={displayedPriceVisibility !== 'INDICATIVE_PRICE'}
                isInvalid={Boolean(errorFor(state.fieldErrors, 'currency'))}
                name="currency"
              >
                <option value="INR">INR — Indian rupee</option>
                <option value="USD">USD — US dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="AED">AED — UAE dirham</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errorFor(state.fieldErrors, 'currency')}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="price-unit">
              <Form.Label>Price per</Form.Label>
              <Form.Control
                defaultValue={product?.priceUnit ?? 'MT'}
                disabled={displayedPriceVisibility !== 'INDICATIVE_PRICE'}
                isInvalid={Boolean(errorFor(state.fieldErrors, 'priceUnit'))}
                list="price-unit-options"
                maxLength={25}
                name="priceUnit"
                placeholder="e.g. MT"
                required={displayedPriceVisibility === 'INDICATIVE_PRICE'}
              />
              <datalist id="price-unit-options">
                <option value="MT" />
                <option value="kg" />
                <option value="tonne" />
                <option value="bag" />
              </datalist>
              <Form.Control.Feedback type="invalid">
                {errorFor(state.fieldErrors, 'priceUnit')}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      </section>

      <Form.Group className="mb-4" controlId="product-applications">
        <Form.Label>
          Applications <span className="text-secondary">(optional)</span>
        </Form.Label>
        <Form.Control
          as="textarea"
          defaultValue={product?.applications.join('\n') ?? ''}
          isInvalid={Boolean(errorFor(state.fieldErrors, 'applications'))}
          maxLength={1200}
          name="applications"
          placeholder="One application per line, e.g.\nSteel making\nFoundry use"
          rows={3}
        />
        <Form.Text>Separate applications with a new line or comma.</Form.Text>
        <Form.Control.Feedback type="invalid">
          {errorFor(state.fieldErrors, 'applications')}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="align-items-center d-flex gap-3 justify-content-between">
        <p className="mb-0 small text-secondary">
          {product
            ? 'Changes are saved to this product. Publication stays under your control.'
            : 'This saves as a draft. It will not appear on the public website.'}
        </p>
        <Button disabled={isPending} type="submit">
          {isPending
            ? 'Saving product…'
            : product
              ? 'Save product changes'
              : 'Save draft product'}
        </Button>
      </div>

      {validationMessage ? (
        <ToastContainer className="p-3" position="top-end">
          <Toast
            autohide
            bg="danger"
            delay={6000}
            onClose={() => setValidationMessage(null)}
            role="alert"
          >
            <Toast.Header closeButton>
              <strong className="me-auto">Cannot save product</strong>
            </Toast.Header>
            <Toast.Body className="text-white">{validationMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
      ) : null}
    </form>
  );
};
