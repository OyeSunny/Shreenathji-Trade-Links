import {
  parseCreateProductDraftForm,
  slugifyCatalogueValue,
} from '@/features/catalogue/product-draft-input';

const createValidFormData = () => {
  const formData = new FormData();
  formData.set('categoryName', 'Iron Ore');
  formData.set('productName', 'Iron Ore Fines');
  formData.set(
    'summary',
    'Industrial-grade fines for bulk steelmaking buyers.',
  );
  formData.set('description', '');
  formData.set('grade', '60% Fe');
  formData.set('form', 'Fines');
  formData.set('applications', 'Steel making\nFoundry use\nSteel making');
  formData.set('minimumOrderQty', '25.000');
  formData.set('orderUnit', 'MT');
  formData.set('availability', 'AVAILABLE_ON_REQUEST');

  return formData;
};

describe('product draft form input', () => {
  it('parses a safe draft and normalizes optional values and applications', () => {
    const result = parseCreateProductDraftForm(createValidFormData());

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toMatchObject({
      categoryName: 'Iron Ore',
      productName: 'Iron Ore Fines',
      applications: ['Steel making', 'Foundry use'],
      minimumOrderQty: '25.000',
      orderUnit: 'MT',
    });
  });

  it('requires an order unit when a minimum quantity is entered', () => {
    const formData = createValidFormData();
    formData.set('orderUnit', '');

    const result = parseCreateProductDraftForm(formData);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.orderUnit).toEqual([
      'Add a unit when entering a minimum order quantity.',
    ]);
  });

  it('creates stable URL-safe slugs without exposing user-provided markup', () => {
    expect(slugifyCatalogueValue('  Iron & Ore <Fines>  ', 'product')).toBe(
      'iron-ore-fines',
    );
    expect(slugifyCatalogueValue('---', 'product')).toBe('product');
  });
});
