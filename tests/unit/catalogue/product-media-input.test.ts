import { parseAddProductMediaForm } from '@/features/catalogue/product-media-input';

const validProductId = 'clx9d4g4s0000s8v3hvjs2x1a';

const createFormData = (imageUrl: string) => {
  const formData = new FormData();
  formData.set('productId', validProductId);
  formData.set('imageUrl', imageUrl);
  formData.set('altText', 'Mill scale ready for a bulk buyer enquiry');
  return formData;
};

describe('product media input', () => {
  it('accepts a project-owned public media path and marks it as safe to publish', () => {
    const result = parseAddProductMediaForm(
      createFormData('/media/product-mill-scale.png'),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data).toMatchObject({
      imageUrl: '/media/product-mill-scale.png',
      mediaOrigin: 'LOCAL_PROJECT_MEDIA',
      fileName: 'product-mill-scale.png',
    });
  });

  it('keeps an HTTPS image pending rights verification instead of publishing it', () => {
    const result = parseAddProductMediaForm(
      createFormData('https://supplier.example.com/images/mill-scale.webp'),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.mediaOrigin).toBe('EXTERNAL_HTTPS');
    expect(result.data.fileName).toBe('mill-scale.webp');
  });

  it('rejects unsafe image URLs and non-media local paths', () => {
    for (const imageUrl of [
      'http://supplier.example.com/mill-scale.jpg',
      'javascript:alert(1)',
      '/private/mill-scale.png',
      '//cdn.example.com/mill-scale.png',
    ]) {
      const result = parseAddProductMediaForm(createFormData(imageUrl));
      expect(result.success).toBe(false);
    }
  });
});
