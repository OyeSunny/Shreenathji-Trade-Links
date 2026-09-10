import { randomUUID } from 'node:crypto';
import { chmod, mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import 'server-only';
import { MAX_VIDEO_BYTES } from '../product-media-input';

const videoSourceDirectory = join(
  process.cwd(),
  'var',
  'media-processing',
  'sources',
);

const acceptedVideoExtensions = new Set([
  'mp4',
  'mov',
  'webm',
  'avi',
  'mkv',
  '3gp',
]);

export class InvalidUploadedVideoError extends Error {}

const getSafeVideoExtension = (fileName: string) => {
  const extension = extname(fileName).slice(1).toLowerCase();

  return acceptedVideoExtensions.has(extension) ? extension : null;
};

export const getPrivateVideoSourcePath = (sourceKey: string) => {
  const sourcePrefix = 'video-sources/';
  if (!sourceKey.startsWith(sourcePrefix)) return null;

  const fileName = sourceKey.slice(sourcePrefix.length);
  if (!fileName || fileName !== basename(fileName)) return null;
  if (!getSafeVideoExtension(fileName)) return null;

  return join(videoSourceDirectory, fileName);
};

export const storePrivateVideoSource = async (file: File) => {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new InvalidUploadedVideoError('Video exceeds the 250 MB limit.');
  }

  const extension = getSafeVideoExtension(file.name);
  if (!extension) {
    throw new InvalidUploadedVideoError(
      'The uploaded file is not a supported video.',
    );
  }

  const sourceKey = `video-sources/${randomUUID()}.${extension}`;
  const path = getPrivateVideoSourcePath(sourceKey);
  if (!path) {
    throw new InvalidUploadedVideoError('The video source path is invalid.');
  }

  await mkdir(videoSourceDirectory, { mode: 0o700, recursive: true });
  await chmod(videoSourceDirectory, 0o700);
  await writeFile(path, Buffer.from(await file.arrayBuffer()), {
    flag: 'wx',
    mode: 0o600,
  });

  return { path, sourceKey };
};

export const removePrivateVideoSource = async (sourceKey: string | null) => {
  if (!sourceKey) return;
  const path = getPrivateVideoSourcePath(sourceKey);
  if (!path) return;

  await rm(path, { force: true });
};
