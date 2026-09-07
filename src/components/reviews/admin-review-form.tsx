'use client';

import type { CustomerReviewFormState } from '@/features/reviews/server/review-actions';
import { useActionState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

type ProductOption = { id: string; name: string };

type ReviewDefaults = {
  id?: string;
  reviewerName?: string;
  companyName?: string | null;
  location?: string | null;
  productId?: string | null;
  productName?: string | null;
  rating?: number;
  comment?: string;
  reviewedOn?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  sortOrder?: number;
};

type AdminReviewFormProps = {
  action: (
    state: CustomerReviewFormState,
    formData: FormData,
  ) => Promise<CustomerReviewFormState>;
  products: ProductOption[];
  review?: ReviewDefaults;
};

const initialState: CustomerReviewFormState = {};

const fieldError = (
  errors: Record<string, string[] | undefined> | undefined,
  field: string,
) => errors?.[field]?.[0];

export function AdminReviewForm({
  action,
  products,
  review,
}: AdminReviewFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate>
      {review?.id ? (
        <input name="reviewId" type="hidden" value={review.id} />
      ) : null}

      {state.message ? (
        <Alert role="alert" variant="danger">
          {state.message}
        </Alert>
      ) : null}

      <Alert variant="light">
        <strong>Publish only customer-approved feedback.</strong> Keep draft
        examples and presentation copy unpublished until the client confirms the
        name, wording, and permission to use it.
      </Alert>

      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="reviewer-name">
            <Form.Label>Reviewer name</Form.Label>
            <Form.Control
              defaultValue={review?.reviewerName}
              isInvalid={Boolean(fieldError(state.fieldErrors, 'reviewerName'))}
              maxLength={120}
              name="reviewerName"
              required
            />
            <Form.Control.Feedback type="invalid">
              {fieldError(state.fieldErrors, 'reviewerName')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="review-company">
            <Form.Label>
              Company <span className="text-secondary">(optional)</span>
            </Form.Label>
            <Form.Control
              defaultValue={review?.companyName ?? ''}
              maxLength={160}
              name="companyName"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="review-location">
            <Form.Label>
              Location <span className="text-secondary">(optional)</span>
            </Form.Label>
            <Form.Control
              defaultValue={review?.location ?? ''}
              maxLength={120}
              name="location"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="review-product">
            <Form.Label>
              Related product <span className="text-secondary">(optional)</span>
            </Form.Label>
            <Form.Select
              defaultValue={review?.productId ?? ''}
              name="productId"
            >
              <option value="">Not product-specific</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {fieldError(state.fieldErrors, 'productId')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mt-3" controlId="review-product-name">
        <Form.Label>
          Product label <span className="text-secondary">(optional)</span>
        </Form.Label>
        <Form.Control
          defaultValue={review?.productName ?? ''}
          maxLength={140}
          name="productName"
          placeholder="Used only when no related product is selected"
        />
      </Form.Group>

      <Row className="g-3 mt-1">
        <Col md={4}>
          <Form.Group controlId="review-rating">
            <Form.Label>Rating</Form.Label>
            <Form.Select defaultValue={review?.rating ?? 5} name="rating">
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} star{rating === 1 ? '' : 's'}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="review-date">
            <Form.Label>
              Review date <span className="text-secondary">(optional)</span>
            </Form.Label>
            <Form.Control
              defaultValue={review?.reviewedOn ?? ''}
              name="reviewedOn"
              type="date"
            />
            <Form.Control.Feedback type="invalid">
              {fieldError(state.fieldErrors, 'reviewedOn')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="review-sort-order">
            <Form.Label>Display order</Form.Label>
            <Form.Control
              defaultValue={review?.sortOrder ?? 0}
              isInvalid={Boolean(fieldError(state.fieldErrors, 'sortOrder'))}
              min={0}
              name="sortOrder"
              type="number"
            />
            <Form.Text>Lower numbers appear first.</Form.Text>
            <Form.Control.Feedback type="invalid">
              {fieldError(state.fieldErrors, 'sortOrder')}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mt-3" controlId="review-comment">
        <Form.Label>Approved feedback</Form.Label>
        <Form.Control
          as="textarea"
          defaultValue={review?.comment}
          isInvalid={Boolean(fieldError(state.fieldErrors, 'comment'))}
          maxLength={1_500}
          name="comment"
          required
          rows={6}
        />
        <Form.Text>
          20–1,500 characters. Public pages render this as plain text.
        </Form.Text>
        <Form.Control.Feedback type="invalid">
          {fieldError(state.fieldErrors, 'comment')}
        </Form.Control.Feedback>
      </Form.Group>

      <section className="border-top mt-4 pt-4">
        <Row className="align-items-end g-3">
          <Col md={5}>
            <Form.Group controlId="review-status">
              <Form.Label>Visibility</Form.Label>
              <Form.Select
                defaultValue={review?.status ?? 'DRAFT'}
                name="status"
              >
                <option value="DRAFT">Draft — private to the owner</option>
                <option value="PUBLISHED">
                  Published — eligible for public display
                </option>
                {review?.status === 'ARCHIVED' ? (
                  <option value="ARCHIVED" disabled>
                    Archived — select Draft or Published to restore
                  </option>
                ) : null}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Check
              defaultChecked={review?.featured ?? false}
              id="review-featured"
              label="Feature this review first"
              name="featured"
            />
          </Col>
          <Col className="d-flex justify-content-md-end" md={3}>
            <Button disabled={isPending} type="submit">
              {isPending
                ? 'Saving…'
                : review?.id
                  ? 'Save review'
                  : 'Create review'}
            </Button>
          </Col>
        </Row>
      </section>
    </form>
  );
}
