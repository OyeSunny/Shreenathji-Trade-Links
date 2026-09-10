import {
  InvalidUploadedImageError,
  getLocalUploadPath,
  removeLocalUpload,
  storeLocalImage,
  storeLocalProductImage,
} from '@/features/catalogue/server/local-image-upload';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const createUpload = (buffer: Buffer, name: string, type: string) =>
  ({
    arrayBuffer: async () =>
      buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      ) as ArrayBuffer,
    name,
    size: buffer.byteLength,
    type,
  }) as File;

const createSourceImage = async (format: 'avif' | 'jpeg' | 'png' | 'webp') =>
  sharp({
    create: {
      background: '#45515b',
      channels: 3,
      height: 120,
      width: 320,
    },
  })
    [format]()
    .toBuffer();

describe('local image upload', () => {
  it.each([
    ['JPEG', 'jpeg', 'image/jpeg', 'material.jpg'],
    ['PNG', 'png', 'image/png', 'material.png'],
    ['WebP', 'webp', 'image/webp', 'material.webp'],
    ['AVIF', 'avif', 'image/avif', 'material.avif'],
  ] as const)(
    'converts a valid %s upload into a WebP file',
    async (_label, format, type, name) => {
      const upload = await storeLocalImage(
        createUpload(await createSourceImage(format), name, type),
      );

      try {
        expect(upload.storageKey).toMatch(/^uploads\/[\w-]+\.webp$/);
        expect(upload.publicUrl).toMatch(/^\/media\/uploads\/[\w-]+\.webp$/);
        expect(upload.fileName).toBe('material.webp');
        expect(upload.mimeType).toBe('image/webp');

        const path = getLocalUploadPath(upload.storageKey);
        expect(path).not.toBeNull();
        expect(await sharp(await readFile(path!)).metadata()).toMatchObject({
          format: 'webp',
          height: 120,
          width: 320,
        });
      } finally {
        await removeLocalUpload(upload.storageKey);
      }
    },
  );

  it('watermarks product uploads before encoding them as WebP', async () => {
    const source = await createSourceImage('png');
    const genericUpload = await storeLocalImage(
      createUpload(source, 'material.png', 'image/png'),
    );
    const productUpload = await storeLocalProductImage(
      createUpload(source, 'material.png', 'image/png'),
    );

    try {
      const [generic, product] = await Promise.all([
        readFile(getLocalUploadPath(genericUpload.storageKey)!),
        readFile(getLocalUploadPath(productUpload.storageKey)!),
      ]);

      expect(await sharp(product).metadata()).toMatchObject({ format: 'webp' });
      expect(product.equals(generic)).toBe(false);
    } finally {
      await Promise.all([
        removeLocalUpload(genericUpload.storageKey),
        removeLocalUpload(productUpload.storageKey),
      ]);
    }
  });

  it('rotates the EXIF orientation into pixels without retaining the metadata', async () => {
    const source = await sharp({
      create: {
        background: '#45515b',
        channels: 3,
        height: 320,
        width: 120,
      },
    })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();
    const upload = await storeLocalImage(
      createUpload(source, 'portrait.jpg', 'image/jpeg'),
    );

    try {
      const metadata = await sharp(
        await readFile(getLocalUploadPath(upload.storageKey)!),
      ).metadata();

      expect(metadata).toMatchObject({
        format: 'webp',
        height: 120,
        width: 320,
      });
      expect(metadata.orientation).toBeUndefined();
    } finally {
      await removeLocalUpload(upload.storageKey);
    }
  });

  it('rejects an image type whose content does not have a matching signature', async () => {
    const upload = createUpload(
      Buffer.from('not actually a PNG'),
      'material.png',
      'image/png',
    );

    await expect(storeLocalImage(upload)).rejects.toThrow(
      InvalidUploadedImageError,
    );
    await expect(storeLocalImage(upload)).rejects.toThrow(
      'The uploaded file is not a valid image.',
    );
  });

  it('rejects an upload larger than 10 MB', async () => {
    const upload = createUpload(
      Buffer.alloc(10 * 1024 * 1024 + 1),
      'material.jpg',
      'image/jpeg',
    );

    await expect(storeLocalImage(upload)).rejects.toThrow(
      'Image exceeds the 10 MB limit.',
    );
  });

  it('rejects a declared PNG whose actual bytes are JPEG', async () => {
    const upload = createUpload(
      await createSourceImage('jpeg'),
      'material.png',
      'image/png',
    );

    await expect(storeLocalImage(upload)).rejects.toThrow(
      'The uploaded file is not a valid image.',
    );
  });

  it('returns a friendly error when a signed image cannot be decoded safely', async () => {
    const upload = createUpload(
      Buffer.from('RIFF\u0004\u0000\u0000\u0000WEBP', 'ascii'),
      'material.webp',
      'image/webp',
    );

    await expect(storeLocalImage(upload)).rejects.toThrow(
      InvalidUploadedImageError,
    );
    await expect(storeLocalImage(upload)).rejects.toThrow(
      'The uploaded image could not be processed safely.',
    );
  });
});
