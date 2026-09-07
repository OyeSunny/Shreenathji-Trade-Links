import { enquirySchema } from '@/features/enquiries/schemas';

describe('enquirySchema', () => {
  it('normalizes an export buyer enquiry', () => {
    expect(
      enquirySchema.parse({
        type: 'EXPORT',
        contactName: 'Aisha Khan',
        companyName: 'Global Metals FZE',
        email: 'BUYER@EXAMPLE.COM ',
        destinationCountry: 'United Arab Emirates',
        materialRequest: 'Iron ore fines, 60% Fe, bulk shipment.',
        quantity: '100',
        unit: 'MT',
      }),
    ).toMatchObject({
      email: 'buyer@example.com',
      type: 'EXPORT',
    });
  });

  it('rejects an enquiry without sufficient material details', () => {
    expect(() =>
      enquirySchema.parse({
        type: 'DOMESTIC',
        contactName: 'Aisha Khan',
        email: 'buyer@example.com',
        materialRequest: 'ore',
      }),
    ).toThrow();
  });

  it('keeps valid product and offer references for server-side verification', () => {
    expect(
      enquirySchema.parse({
        type: 'DOMESTIC',
        contactName: 'Aisha Khan',
        email: 'buyer@example.com',
        materialRequest: 'Please share the available grade and packaging.',
        productSlug: 'mill-scale',
        offerSlug: 'limited-stock-mill-scale',
      }),
    ).toMatchObject({
      productSlug: 'mill-scale',
      offerSlug: 'limited-stock-mill-scale',
    });
  });
});
