import {
  parseUpdateCategoryForm,
  parseUpdateProductForm,
} from '@/features/catalogue/product-management-input';

const productId = 'clx4w5e6r0000s8d9f0g1h2i3';
const categoryId = 'clx4w5e6r0001s8d9f0g1h2i4';

const createValidProductForm = () => {
  const formData = new FormData();
  formData.set('productId', productId);
  formData.set('categoryId', categoryId);
  formData.set('productName', 'Iron Ore Fines');
  formData.set(
    'summary',
    'Reliable bulk fines for steelmaking and foundry buyers.',
  );
  formData.set('description', 'Prepared for domestic and export enquiries.');
  formData.set('grade', '60% Fe');
  formData.set('form', 'Fines');
  formData.set('applications', 'Steel making\nFoundry use');
  formData.set('packaging', 'Bulk vessel or covered truck');
  formData.set('minimumOrderQty', '25');
  formData.set('orderUnit', 'MT');
  formData.set('priceVisibility', 'INDICATIVE_PRICE');
  formData.set('indicativePrice', '7800.50');
  formData.set('currency', 'INR');
  formData.set('availability', 'AVAILABLE_ON_REQUEST');
  formData.set('featured', 'on');
  formData.set('seoTitle', 'Iron Ore Fines | Shreenathji Trade Links');
  formData.set('seoDescription', 'Request a quote for iron ore fines.');
  formData.set(
    'specifications',
    'Iron content | 60 | %\nMoisture | On request |',
  );
  return formData;
};

describe('product management form input', () => {
  it('parses every buyer-facing product field and structured specifications', () => {
    const result = parseUpdateProductForm(createValidProductForm());

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toMatchObject({
      productId,
      categoryId,
      applications: ['Steel making', 'Foundry use'],
      featured: true,
      indicativePrice: '7800.50',
      currency: 'INR',
      specifications: [
        { label: 'Iron content', value: '60', unit: '%' },
        { label: 'Moisture', value: 'On request', unit: undefined },
      ],
    });
  });

  it('requires a currency when showing an indicative price', () => {
    const formData = createValidProductForm();
    formData.set('currency', '');

    const result = parseUpdateProductForm(formData);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors).toMatchObject({
      currency: [
        'Add a three-letter currency code when entering an indicative price.',
      ],
    });
  });

  it('rejects malformed specification rows instead of silently storing them', () => {
    const formData = createValidProductForm();
    formData.set('specifications', 'Iron content only');

    const result = parseUpdateProductForm(formData);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.specifications).toEqual([
      'Use “Label | Value | Unit” for each specification line.',
    ]);
  });

  it('parses category presentation controls without allowing arbitrary status values', () => {
    const formData = new FormData();
    formData.set('categoryId', categoryId);
    formData.set('name', 'Iron Ore');
    formData.set('introduction', 'Bulk materials for industrial buyers.');
    formData.set('featured', 'on');
    formData.set('sortOrder', '4');
    formData.set('status', 'PUBLISHED');

    const result = parseUpdateCategoryForm(formData);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toMatchObject({
      categoryId,
      featured: true,
      sortOrder: 4,
      status: 'PUBLISHED',
    });
  });
});
