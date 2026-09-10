import {
  parseAddProductMediaForm,
  parseAddProductVideoForm,
} from '@/features/catalogue/product-media-input';

const validProductId = 'clx9d4g4s0000s8v3hvjs2x1a';

const createFormData = (file?: File) => {
  const formData = new FormData();
  formData.set('productId', validProductId);
  formData.set('caption', 'Mill Scale Fe 70');
  formData.set('altText', 'Mill scale ready for a bulk buyer enquiry');
  if (file) formData.set('image', file);
  return formData;
};

const createVideoFormData = (file?: File) => {
  const formData = new FormData();
  formData.set('productId', validProductId);
  formData.set('caption', 'Mill Scale Fe 70');
  formData.set('altText', 'Mill scale ready for a bulk buyer enquiry');
  if (file) formData.set('video', file);
  return formData;
};

describe('product media input', () => {
  it('accepts an owner-uploaded supported image', () => {
    const image = new File(['image'], 'mill-scale.png', { type: 'image/png' });
    const result = parseAddProductMediaForm(createFormData(image));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.file).toBe(image);
    expect(result.data.caption).toBe('Mill Scale Fe 70');
  });

  it('accepts a JPEG from WhatsApp when the browser omits its file type', () => {
    const image = new File(['image'], 'mill-scale-from-whatsapp.jpeg', {
      type: '',
    });
    const result = parseAddProductMediaForm(createFormData(image));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.mimeType).toBe('image/jpeg');
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

  it.each([
    ['clip.mp4', 'video/mp4'],
    ['clip.mov', 'video/quicktime'],
    ['clip.webm', 'video/webm'],
    ['clip.avi', 'video/x-msvideo'],
    ['clip.mkv', 'video/x-matroska'],
    ['clip.3gp', 'video/3gpp'],
  ])('accepts a common owner video file: %s', (name, type) => {
    const video = new File(['video'], name, { type });
    const result = parseAddProductVideoForm(createVideoFormData(video));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.file).toBe(video);
  });

  it('accepts a supported video based on its extension when the browser omits its type', () => {
    const video = new File(['video'], 'iphone-clip.mov', { type: '' });
    const result = parseAddProductVideoForm(createVideoFormData(video));

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.extension).toBe('mov');
  });

  it('rejects a video over the 250 MB owner upload limit', () => {
    const video = new File(
      [new Uint8Array(250 * 1024 * 1024 + 1)],
      'large-video.mp4',
      { type: 'video/mp4' },
    );
    const result = parseAddProductVideoForm(createVideoFormData(video));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      (result.error.flatten().fieldErrors as { video?: string[] }).video,
    ).toEqual(['Keep each video under 250 MB.']);
  });

  it('rejects a video with an unsupported extension', () => {
    const video = new File(['video'], 'material.pdf', {
      type: 'application/pdf',
    });

    const result = parseAddProductVideoForm(createVideoFormData(video));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      (result.error.flatten().fieldErrors as { video?: string[] }).video,
    ).toEqual(['Use an MP4, MOV, WebM, AVI, MKV, or 3GP video.']);
  });
});
