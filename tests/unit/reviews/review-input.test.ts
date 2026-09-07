import {
  parseCreateCustomerReviewForm,
  parseUpdateCustomerReviewForm,
} from '@/features/reviews/review-input';

const reviewId = 'clx9d4g4s0000s8v3hvjs2x1a';

const validReviewForm = () => {
  const formData = new FormData();
  formData.set('reviewerName', 'Aisha Khan');
  formData.set('companyName', 'Global Metals FZE');
  formData.set('location', 'Dubai, UAE');
  formData.set('productId', '');
  formData.set('productName', 'Bulk material supply');
  formData.set('rating', '5');
  formData.set(
    'comment',
    'Clear material details, practical communication, and dependable follow-up through dispatch.',
  );
  formData.set('reviewedOn', '2026-09-03');
  formData.set('status', 'DRAFT');
  formData.set('featured', 'on');
  formData.set('sortOrder', '2');
  return formData;
};

describe('customer review form input', () => {
  it('parses an owner-approved review with safe, normalized optional fields', () => {
    const result = parseCreateCustomerReviewForm(validReviewForm());

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toMatchObject({
      reviewerName: 'Aisha Khan',
      companyName: 'Global Metals FZE',
      productId: undefined,
      rating: 5,
      status: 'DRAFT',
      featured: true,
      sortOrder: 2,
    });
    expect(result.data.reviewedOn?.toISOString()).toContain('2026-09-03');
  });

  it('rejects a too-short review and invalid publication controls', () => {
    const formData = validReviewForm();
    formData.set('comment', 'Looks good');
    formData.set('status', 'ARCHIVED');
    formData.set('rating', '9');

    const result = parseCreateCustomerReviewForm(formData);

    expect(result.success).toBe(false);
  });

  it('requires a valid review identifier before an edit can reach an action', () => {
    const formData = validReviewForm();
    formData.set('reviewId', '<script>not-an-id</script>');

    expect(parseUpdateCustomerReviewForm(formData).success).toBe(false);

    formData.set('reviewId', reviewId);
    expect(parseUpdateCustomerReviewForm(formData).success).toBe(true);
  });
});
