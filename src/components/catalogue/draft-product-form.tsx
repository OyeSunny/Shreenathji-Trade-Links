'use client';

import {
  createProductDraft,
  type ProductDraftFormState,
  updateProduct,
} from '@/app/admin/catalogue/actions';
import { useActionState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

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

  return (
    <form action={formAction} noValidate>
      {product ? (
        <input name="productId" type="hidden" value={product.id} />
      ) : null}
      {state.message ? (
        <Alert role="alert" variant="danger">
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
    </form>
  );
};
