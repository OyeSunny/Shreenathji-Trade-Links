import { parseCreateOfferForm } from '@/features/offers/offer-input';

const validOfferForm = () => {
  const formData = new FormData();
  formData.set('productId', 'ckv0a1b2c0000s4r512345678');
  formData.set('title', 'Limited stock: Mill Scale');
  formData.set(
    'summary',
    'A current supply opportunity for qualified industrial buyers.',
  );
  formData.set('details', 'Share your target specification and quantity.');
  formData.set('startsAt', '2026-09-05');
  formData.set('endsAt', '2026-09-30');

  return formData;
};

describe('offer form input', () => {
  it('parses a safe owner-managed offer with a valid schedule', () => {
    const result = parseCreateOfferForm(validOfferForm());

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toMatchObject({
      title: 'Limited stock: Mill Scale',
      productId: 'ckv0a1b2c0000s4r512345678',
    });
  });

  it('does not allow an offer to end before it starts', () => {
    const formData = validOfferForm();
    formData.set('endsAt', '2026-09-04');

    const result = parseCreateOfferForm(formData);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.endsAt).toEqual([
      'The end date must be later than the start date.',
    ]);
  });
});
