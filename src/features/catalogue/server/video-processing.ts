import { spawn } from 'node:child_process';
import 'server-only';

const MAX_VIDEO_DURATION_SECONDS = 300;
const MAX_PROCESS_OUTPUT_BYTES = 16 * 1024;

const processTimeouts = {
  poster: 120_000,
  probe: 20_000,
  transcode: 600_000,
} as const;

const processingFailureMessage = 'Video file could not be processed.';

export class VideoProcessingError extends Error {
  constructor() {
    super(processingFailureMessage);
    this.name = 'VideoProcessingError';
  }
}

export type VideoPaths = {
  inputPath: string;
  outputPath: string;
  posterPath: string;
};

export type VideoProcessResult = {
  stderr: string;
  stdout: string;
};

export type VideoProcessOptions = {
  maxOutputBytes: number;
  shell: false;
  timeoutMs: number;
};

export type VideoProcessRunner = (
  binary: 'ffmpeg' | 'ffprobe',
  args: readonly string[],
  options: VideoProcessOptions,
) => Promise<VideoProcessResult>;

const appendBoundedOutput = (
  current: Buffer,
  chunk: Buffer | string,
  maximumBytes: number,
) => {
  if (current.length >= maximumBytes) return current;

  const next = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
  const remainingBytes = maximumBytes - current.length;

  return Buffer.concat([current, next.subarray(0, remainingBytes)]);
};

export const spawnFile: VideoProcessRunner = (binary, args, options) =>
  new Promise((resolve, reject) => {
    let settled = false;
    let stderr: Buffer<ArrayBufferLike> = Buffer.alloc(0);
    let stdout: Buffer<ArrayBufferLike> = Buffer.alloc(0);
    let timedOut = false;

    const fail = () => {
      if (settled) return;
      settled = true;
      reject(new VideoProcessingError());
    };

    try {
      const child = spawn(binary, [...args], {
        shell: options.shell,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });

      const timeout = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, options.timeoutMs);

      child.stdout?.on('data', (chunk: Buffer | string) => {
        stdout = appendBoundedOutput(stdout, chunk, options.maxOutputBytes);
      });
      child.stderr?.on('data', (chunk: Buffer | string) => {
        stderr = appendBoundedOutput(stderr, chunk, options.maxOutputBytes);
      });
      child.once('error', () => {
        clearTimeout(timeout);
        fail();
      });
      child.once('close', (exitCode) => {
        clearTimeout(timeout);
        if (timedOut || exitCode !== 0) {
          fail();
          return;
        }

        if (settled) return;
        settled = true;
        resolve({
          stderr: stderr.toString('utf8'),
          stdout: stdout.toString('utf8'),
        });
      });
    } catch {
      fail();
    }
  });

export const buildVideoConversionCommands = ({
  inputPath,
  outputPath,
  posterPath,
}: VideoPaths) => ({
  poster: [
    '-nostdin',
    '-y',
    '-ss',
    '00:00:01',
    '-i',
    outputPath,
    '-frames:v',
    '1',
    '-vf',
    'scale=1280:-2',
    '-c:v',
    'libwebp',
    '-quality',
    '78',
    posterPath,
  ],
  probe: [
    '-v',
    'error',
    '-show_entries',
    'format=duration:stream=codec_type',
    '-of',
    'json',
    inputPath,
  ],
  transcode: [
    '-nostdin',
    '-y',
    '-i',
    inputPath,
    '-map',
    '0:v:0',
    '-map',
    '0:a?',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '23',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    outputPath,
  ],
});

const run = async (
  runner: VideoProcessRunner,
  binary: 'ffmpeg' | 'ffprobe',
  args: readonly string[],
  timeoutMs: number,
) => {
  try {
    return await runner(binary, args, {
      maxOutputBytes: MAX_PROCESS_OUTPUT_BYTES,
      shell: false,
      timeoutMs,
    });
  } catch (error) {
    if (error instanceof VideoProcessingError) throw error;
    throw new VideoProcessingError();
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getDurationSeconds = (stdout: string) => {
  try {
    const probe = JSON.parse(stdout) as unknown;
    if (!isRecord(probe) || !isRecord(probe.format)) {
      throw new VideoProcessingError();
    }

    const streams = probe.streams;
    const hasVideoStream =
      Array.isArray(streams) &&
      streams.some(
        (stream) => isRecord(stream) && stream.codec_type === 'video',
      );
    const durationSeconds = Number(probe.format.duration);

    if (
      !hasVideoStream ||
      !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0 ||
      durationSeconds > MAX_VIDEO_DURATION_SECONDS
    ) {
      throw new VideoProcessingError();
    }

    return durationSeconds;
  } catch (error) {
    if (error instanceof VideoProcessingError) throw error;
    throw new VideoProcessingError();
  }
};

export const inspectVideo = async (
  inputPath: string,
  { runner = spawnFile }: { runner?: VideoProcessRunner } = {},
) => {
  const { probe } = buildVideoConversionCommands({
    inputPath,
    outputPath: '',
    posterPath: '',
  });
  const result = await run(runner, 'ffprobe', probe, processTimeouts.probe);

  return { durationSeconds: getDurationSeconds(result.stdout) };
};

export const processVideo = async (
  paths: VideoPaths,
  { runner = spawnFile }: { runner?: VideoProcessRunner } = {},
) => {
  const inspection = await inspectVideo(paths.inputPath, { runner });
  const { poster, transcode } = buildVideoConversionCommands(paths);

  await run(runner, 'ffmpeg', transcode, processTimeouts.transcode);
  await run(runner, 'ffmpeg', poster, processTimeouts.poster);

  return inspection;
};
