import { processNextProductVideo } from '@/features/catalogue/server/video-worker';

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function run() {
  for (;;) {
    const processed = await processNextProductVideo();
    if (!processed) await wait(5_000);
  }
}

void run();
