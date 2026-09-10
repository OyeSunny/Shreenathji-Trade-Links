import {
  MediaProcessingStatus,
  MediaRightsStatus,
  MediaSource,
  PublicationStatus,
} from '@/generated/prisma/client';
import { db } from '@/lib/db';
import { chmod, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import 'server-only';
import { getLocalUploadPath, removeLocalUpload } from './local-image-upload';
import {
  getPrivateVideoSourcePath,
  removePrivateVideoSource,
} from './local-video-upload';
import { processVideo } from './video-processing';

const failureMessage =
  'Video processing failed. Please upload the video again.';

const outputFor = (mediaId: string) => {
  const storageKey = `uploads/${mediaId}.mp4`;
  const posterStorageKey = `uploads/${mediaId}.webp`;
  const outputPath = getLocalUploadPath(storageKey);
  const posterPath = getLocalUploadPath(posterStorageKey);

  if (!outputPath || !posterPath) throw new Error('VIDEO_OUTPUT_PATH_INVALID');

  return {
    outputPath,
    posterPath,
    posterStorageKey,
    storageKey,
  };
};

export async function processNextProductVideo() {
  const candidate = await db.mediaProcessingJob.findFirst({
    where: { status: MediaProcessingStatus.PENDING },
    orderBy: { createdAt: 'asc' },
    select: { id: true, mediaId: true, sourceKey: true },
  });
  if (!candidate) return false;

  const claim = await db.mediaProcessingJob.updateMany({
    where: { id: candidate.id, status: MediaProcessingStatus.PENDING },
    data: {
      attempts: { increment: 1 },
      startedAt: new Date(),
      status: MediaProcessingStatus.PROCESSING,
    },
  });
  if (claim.count === 0) return true;

  const sourcePath = getPrivateVideoSourcePath(candidate.sourceKey);
  const output = outputFor(candidate.mediaId);

  try {
    if (!sourcePath) throw new Error('VIDEO_SOURCE_PATH_INVALID');

    await mkdir(dirname(output.outputPath), { mode: 0o755, recursive: true });
    await chmod(dirname(output.outputPath), 0o755);
    await processVideo({
      inputPath: sourcePath,
      outputPath: output.outputPath,
      posterPath: output.posterPath,
    });

    await db.$transaction([
      db.mediaAsset.update({
        where: { id: candidate.mediaId },
        data: {
          mimeType: 'video/mp4',
          posterStorageKey: output.posterStorageKey,
          posterUrl: `/media/${output.posterStorageKey}`,
          processingError: null,
          processingStatus: MediaProcessingStatus.READY,
          rightsStatus: MediaRightsStatus.APPROVED,
          source: MediaSource.PROJECT_CREATED,
          sourceUrl: `/media/${output.storageKey}`,
          status: PublicationStatus.PUBLISHED,
          storageKey: output.storageKey,
        },
      }),
      db.mediaProcessingJob.update({
        where: { id: candidate.id },
        data: {
          error: null,
          finishedAt: new Date(),
          status: MediaProcessingStatus.READY,
        },
      }),
    ]);
    await removePrivateVideoSource(candidate.sourceKey);
  } catch {
    await Promise.all([
      removeLocalUpload(output.storageKey),
      removeLocalUpload(output.posterStorageKey),
    ]);
    await db.$transaction([
      db.mediaAsset.update({
        where: { id: candidate.mediaId },
        data: {
          processingError: failureMessage,
          processingStatus: MediaProcessingStatus.FAILED,
          status: PublicationStatus.DRAFT,
        },
      }),
      db.mediaProcessingJob.update({
        where: { id: candidate.id },
        data: {
          error: failureMessage,
          finishedAt: new Date(),
          status: MediaProcessingStatus.FAILED,
        },
      }),
    ]);
    await removePrivateVideoSource(candidate.sourceKey);
  }

  return true;
}
