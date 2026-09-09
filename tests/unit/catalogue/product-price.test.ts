import { formatPublicProductPrice } from '@/features/catalogue/product-price';

describe('formatPublicProductPrice', () => {
  it('formats an owner-approved INR price per metric tonne for buyers', () => {
    expect(
      formatPublicProductPrice({
        currency: 'INR',
        indicativePrice: '4250.5',
        priceUnit: 'MT',
        priceVisibility: 'INDICATIVE_PRICE',
      }),
    ).toBe('₹4,250.50 / MT');
  });

  it('keeps prices private when the owner selects ask for price', () => {
    expect(
      formatPublicProductPrice({
        currency: 'INR',
        indicativePrice: '4250.5',
        priceUnit: 'MT',
        priceVisibility: 'ASK_FOR_PRICE',
      }),
    ).toBeNull();
  });
});
