import {
  getPrivateVideoSourcePath,
  removePrivateVideoSource,
  storePrivateVideoSource,
} from '@/features/catalogue/server/local-video-upload';
import { readFile, stat } from 'node:fs/promises';

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

describe('private video source upload', () => {
  it('stores an owner video source outside public media', async () => {
    const source = Buffer.from('owner-video-source');
    const upload = await storePrivateVideoSource(
      createUpload(source, 'iphone-material.mov', 'video/quicktime'),
    );

    try {
      expect(upload.sourceKey).toMatch(/^video-sources\/[\w-]+\.mov$/);
      expect(upload.path).toContain('/var/media-processing/sources/');
      expect(upload.path).not.toContain('/public/');
      await expect(readFile(upload.path)).resolves.toEqual(source);
    } finally {
      await removePrivateVideoSource(upload.sourceKey);
    }
  });

  it('does not resolve a private source path outside its single source directory', () => {
    expect(getPrivateVideoSourcePath('../uploads/private.mov')).toBeNull();
    expect(
      getPrivateVideoSourcePath('video-sources/nested/private.mov'),
    ).toBeNull();
    expect(getPrivateVideoSourcePath('uploads/private.mov')).toBeNull();
  });

  it('keeps the private source directory and file owner-only', async () => {
    const upload = await storePrivateVideoSource(
      createUpload(Buffer.from('private-video'), 'material.mp4', 'video/mp4'),
    );

    try {
      const directory = upload.path.replace(/\/[^/]+$/, '');
      const [directoryStat, fileStat] = await Promise.all([
        stat(directory),
        stat(upload.path),
      ]);

      expect(directoryStat.mode & 0o777).toBe(0o700);
      expect(fileStat.mode & 0o777).toBe(0o600);
    } finally {
      await removePrivateVideoSource(upload.sourceKey);
    }
  });
});
