import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import 'server-only';

const uploadDirectory = join(process.cwd(), 'public', 'media', 'uploads');

const extensionForType: Record<string, string> = {
  'image/avif': '.avif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const hasValidImageSignature = (bytes: Uint8Array, mimeType: string) => {
  if (mimeType === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  if (mimeType === 'image/webp') {
    return (
      new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
      new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
    );
  }
  if (mimeType === 'image/avif') {
    return new TextDecoder().decode(bytes.slice(4, 12)).includes('ftyp');
  }
  return false;
};

export class InvalidUploadedImageError extends Error {}

export async function storeLocalImage(file: File) {
  if (file.size > 10 * 1024 * 1024) {
    throw new InvalidUploadedImageError('Image exceeds the 10 MB limit.');
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = extensionForType[file.type];

  if (!extension || !hasValidImageSignature(buffer, file.type)) {
    throw new InvalidUploadedImageError(
      'The uploaded file is not a valid image.',
    );
  }

  await mkdir(uploadDirectory, { recursive: true });
  const fileName = `${randomUUID()}${extension}`;
  await writeFile(join(uploadDirectory, fileName), buffer, { flag: 'wx' });

  return {
    fileName: file.name.slice(0, 180) || `product-image${extension}`,
    publicUrl: `/media/uploads/${fileName}`,
    storageKey: `uploads/${fileName}`,
  };
}

export const storeLocalProductImage = storeLocalImage;

export const isLocalUploadStorageKey = (storageKey: string | null) =>
  Boolean(storageKey?.startsWith('uploads/'));

export const getLocalUploadPath = (storageKey: string) => {
  const fileName = storageKey.slice('uploads/'.length);

  if (!fileName || fileName !== storageKey.split('/').at(-1)) return null;
  if (extname(fileName) === '') return null;

  return join(uploadDirectory, fileName);
};

export const removeLocalUpload = async (storageKey: string | null) => {
  if (!storageKey || !isLocalUploadStorageKey(storageKey)) return;
  const path = getLocalUploadPath(storageKey);
  if (!path) return;
  await rm(path, { force: true });
};
