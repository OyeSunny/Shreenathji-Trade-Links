import { parseAddProductMediaForm } from '@/features/catalogue/product-media-input';

const validProductId = 'clx9d4g4s0000s8v3hvjs2x1a';

const createFormData = (file?: File) => {
  const formData = new FormData();
  formData.set('productId', validProductId);
  formData.set('altText', 'Mill scale ready for a bulk buyer enquiry');
  if (file) formData.set('image', file);
  return formData;
};

describe('product media input', () => {
  it('accepts an owner-uploaded supported image', () => {
    const image = new File(['image'], 'mill-scale.png', { type: 'image/png' });
    const result = parseAddProductMediaForm(createFormData(image));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.file).toBe(image);
  });

  it('requires an image file', () => {
    const result = parseAddProductMediaForm(createFormData());

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      (result.error.flatten().fieldErrors as { image?: string[] }).image,
    ).toEqual(['Choose an image to upload.']);
  });

  it('rejects unsupported uploads and oversized images', () => {
    const unsupported = new File(['pdf'], 'spec.pdf', {
      type: 'application/pdf',
    });
    const oversized = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      'large.jpg',
      {
        type: 'image/jpeg',
      },
    );

    expect(parseAddProductMediaForm(createFormData(unsupported)).success).toBe(
      false,
    );
    expect(parseAddProductMediaForm(createFormData(oversized)).success).toBe(
      false,
    );
  });
});
