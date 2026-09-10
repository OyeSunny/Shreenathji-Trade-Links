import { describe, expect, it, vi } from 'vitest';

const findFirst = vi.hoisted(() => vi.fn());
const findMany = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  db: { product: { findFirst, findMany } },
}));

import {
  getPublishedProductBySlug,
  getPublishedProducts,
  toPublicProductMedia,
} from '@/features/catalogue/server/public-catalogue';
import {
  buildVideoConversionCommands,
  inspectVideo,
  processVideo,
  type VideoProcessRunner,
} from '@/features/catalogue/server/video-processing';

describe('toPublicProductMedia', () => {
  it('exposes a ready approved published video only when it has public playback and poster URLs', () => {
    expect(
      toPublicProductMedia({
        altText: 'Mill scale Fe-70 demonstration',
        caption: 'Mill scale Fe-70',
        media: {
          kind: 'VIDEO',
          processingStatus: 'READY',
          rightsStatus: 'APPROVED',
          status: 'PUBLISHED',
          sourceUrl: '/media/uploads/mill-scale-fe-70.mp4',
          posterUrl: '/media/uploads/mill-scale-fe-70.webp',
          storageKey: 'media/uploads/mill-scale-fe-70.mp4',
        },
      }),
    ).toEqual({
      kind: 'VIDEO',
      src: '/media/uploads/mill-scale-fe-70.mp4',
      posterUrl: '/media/uploads/mill-scale-fe-70.webp',
      altText: 'Mill scale Fe-70 demonstration',
      caption: 'Mill scale Fe-70',
    });
  });

  it('keeps non-ready videos out of public output', () => {
    expect(
      toPublicProductMedia({
        altText: null,
        caption: null,
        media: {
          kind: 'VIDEO',
          processingStatus: 'PROCESSING',
          rightsStatus: 'APPROVED',
          status: 'PUBLISHED',
          sourceUrl: '/media/uploads/mill-scale-fe-70.mp4',
          posterUrl: '/media/uploads/mill-scale-fe-70.webp',
          storageKey: 'media/uploads/mill-scale-fe-70.mp4',
        },
      }),
    ).toBeNull();
  });

  it('adds only ready video media to the product detail gallery query', async () => {
    findFirst.mockResolvedValue(null);

    await getPublishedProductBySlug('mill-scale');

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          media: expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({
                  media: expect.objectContaining({
                    is: expect.objectContaining({
                      kind: 'VIDEO',
                      processingStatus: 'READY',
                    }),
                  }),
                }),
              ]),
            }),
          }),
        }),
      }),
    );
  });

  it('keeps video media out of product card queries', async () => {
    findMany.mockResolvedValue([]);

    await getPublishedProducts();

    const query = findMany.mock.calls.at(-1)?.[0];
    const cardMediaWhere = query?.include?.media?.where?.media?.is;

    expect(cardMediaWhere).toMatchObject({ kind: 'IMAGE' });
    expect(cardMediaWhere).not.toMatchObject({ kind: 'VIDEO' });
    expect(query?.include?.media?.where).not.toHaveProperty('OR');
  });
});

describe('video conversion process boundary', () => {
  const paths = {
    inputPath:
      '/private/video-sources/6ab8fca4-4ce5-47a8-8057-1a22c67e8c64.mov',
    outputPath: '/public/media/uploads/video-cmt5w3e8y0001jll4a3e2m8q7.mp4',
    posterPath: '/public/media/uploads/video-cmt5w3e8y0001jll4a3e2m8q7.webp',
  };

  it('builds H.264/AAC MP4 and WebP poster arguments without a shell command', () => {
    const commands = buildVideoConversionCommands(paths);

    expect(commands.probe).toEqual(
      expect.arrayContaining([
        '-show_entries',
        'format=duration:stream=codec_type',
      ]),
    );
    expect(commands.transcode).toEqual(
      expect.arrayContaining([
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-movflags',
        '+faststart',
      ]),
    );
    expect(commands.poster).toEqual(
      expect.arrayContaining(['-frames:v', '1', '-c:v', 'libwebp']),
    );
    expect(commands.transcode).toContain(paths.inputPath);
    expect(commands.transcode).toContain(paths.outputPath);
    expect(commands.transcode).not.toContain('iphone-material.mov');
  });

  it('rejects a probe result without a video stream', async () => {
    const runner: VideoProcessRunner = async () => ({
      stderr: '',
      stdout: JSON.stringify({
        format: { duration: '4.2' },
        streams: [{ codec_type: 'audio' }],
      }),
    });

    await expect(inspectVideo(paths.inputPath, { runner })).rejects.toThrow(
      'Video file could not be processed.',
    );
  });

  it('rejects videos longer than five minutes before ffmpeg runs', async () => {
    const runner = vi.fn<VideoProcessRunner>().mockResolvedValue({
      stderr: '',
      stdout: JSON.stringify({
        format: { duration: '300.01' },
        streams: [{ codec_type: 'video' }],
      }),
    });

    await expect(processVideo(paths, { runner })).rejects.toThrow(
      'Video file could not be processed.',
    );
    expect(runner).toHaveBeenCalledTimes(1);
    expect(runner).toHaveBeenCalledWith(
      'ffprobe',
      expect.any(Array),
      expect.objectContaining({ shell: false }),
    );
  });

  it('runs probe, transcode, and poster generation with argument arrays', async () => {
    const runner = vi
      .fn<VideoProcessRunner>()
      .mockImplementation(async (binary) => {
        if (binary === 'ffprobe') {
          return {
            stderr: '',
            stdout: JSON.stringify({
              format: { duration: '42.5' },
              streams: [{ codec_type: 'video' }],
            }),
          };
        }

        return { stderr: '', stdout: '' };
      });

    await expect(processVideo(paths, { runner })).resolves.toEqual({
      durationSeconds: 42.5,
    });
    expect(runner).toHaveBeenNthCalledWith(
      2,
      'ffmpeg',
      expect.arrayContaining(['-c:v', 'libx264', paths.outputPath]),
      expect.objectContaining({ shell: false }),
    );
    expect(runner).toHaveBeenNthCalledWith(
      3,
      'ffmpeg',
      expect.arrayContaining(['-frames:v', '1', paths.posterPath]),
      expect.objectContaining({ shell: false }),
    );
  });
});
