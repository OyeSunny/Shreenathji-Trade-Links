# Product Video and Mobile Type Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the owner upload common product-video formats which are safely converted to iPhone-compatible MP4/WebP poster media, while making public phone typography compact and stable.

**Architecture:** Add a durable video-processing job table and private source directory. The existing owner product-media action stores a pending video and returns immediately; a single systemd Node worker validates it through FFprobe, invokes FFmpeg using argument arrays, creates MP4/WebP output, and publishes the media only on success. The current product media association becomes a mixed image/video gallery, while product cards remain image-only.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma/PostgreSQL, TypeScript, Sharp, FFmpeg/FFprobe, systemd, Nginx, Vitest, Playwright CLI.

---

## File structure

```text
prisma/schema.prisma                                      # video metadata + durable processing jobs
prisma/migrations/*_product_video_jobs/...                # Prisma-generated database migration
next.config.ts                                            # 250 MB server-action body limit
src/features/catalogue/product-media-input.ts             # image/video form parsing and safe limits
src/features/catalogue/server/local-video-upload.ts       # private source file storage and safe deletion
src/features/catalogue/server/video-processing.ts         # ffprobe/ffmpeg command construction + output paths
src/features/catalogue/server/video-worker.ts             # claim/process one durable job
scripts/process-product-videos.ts                         # long-running worker entrypoint
src/app/admin/catalogue/actions.ts                        # owner video upload, remove/revalidate semantics
src/components/catalogue/product-media-form.tsx           # separate image and video upload controls
src/app/admin/catalogue/[id]/media/page.tsx               # video status/poster/primary-image constraints
src/features/catalogue/server/public-catalogue.ts         # image card query + mixed product gallery query
src/components/catalogue/product-image-carousel.tsx       # discriminated image/video gallery UI
src/components/catalogue/product-image-carousel.module.css# play poster/media controls
src/app/globals.css                                       # coherent public phone type scale
deploy/systemd/shreenathji-product-video-worker.service   # production worker service
deploy/README.md                                          # FFmpeg, migration, worker deploy guidance
tests/unit/catalogue/product-media-input.test.ts          # image/video input parsing
tests/unit/catalogue/video-processing.test.ts             # command/output/security tests
tests/unit/catalogue/video-worker.test.ts                 # state transition tests
tests/unit/components/catalogue/product-image-carousel.test.tsx # image/video gallery tests
```

### Task 1: Create durable video data boundaries

**Files:**

- Modify: `prisma/schema.prisma`
- Create: Prisma-generated `product_video_jobs` migration SQL
- Create: `tests/unit/catalogue/video-processing.test.ts`

- [ ] **Step 1: Write the failing data-contract test**

```ts
it('only exposes a ready video with a generated poster', () => {
  expect(toPublicProductMedia({
    kind: 'VIDEO',
    processingStatus: 'READY',
    sourceUrl: '/media/uploads/video.mp4',
    posterUrl: '/media/uploads/poster.webp',
  })).toEqual({
    kind: 'VIDEO',
    posterUrl: '/media/uploads/poster.webp',
    src: '/media/uploads/video.mp4',
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run tests/unit/catalogue/video-processing.test.ts --maxWorkers=1`

Expected: FAIL because `toPublicProductMedia` and video persistence fields do not exist.

- [ ] **Step 3: Add explicit schema state**

```prisma
enum MediaProcessingStatus {
  PENDING
  PROCESSING
  READY
  FAILED
}

model MediaAsset {
  // existing fields
  posterStorageKey String? @unique
  posterUrl        String?
  processingStatus MediaProcessingStatus?
  processingError  String?
  processingJob    MediaProcessingJob?
}

model MediaProcessingJob {
  id          String                @id @default(cuid())
  mediaId     String                @unique
  media       MediaAsset            @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  status      MediaProcessingStatus @default(PENDING)
  sourceKey   String                @unique
  attempts    Int                   @default(0)
  startedAt   DateTime?
  finishedAt  DateTime?
  error       String?
  createdAt   DateTime              @default(now())
  updatedAt   DateTime              @updatedAt

  @@index([status, createdAt])
}
```

Generate a Prisma migration. Add migration SQL that sets video records to private drafts until a job marks them ready; do not alter existing image records.

- [ ] **Step 4: Add the minimal public-mapping implementation**

In `src/features/catalogue/server/public-catalogue.ts`, add a typed function that returns an image slide only for approved/published `IMAGE` media, and a video slide only when approved/published `VIDEO` has `processingStatus: READY`, public source URL and poster URL.

- [ ] **Step 5: Run schema and focused tests**

Run: `pnpm prisma:validate && pnpm prisma:generate && pnpm vitest run tests/unit/catalogue/video-processing.test.ts --maxWorkers=1`

Expected: schema valid and test passes.

- [ ] **Step 6: Commit**

```bash
git add prisma src/features/catalogue/server/public-catalogue.ts tests/unit/catalogue/video-processing.test.ts
git commit -m "feat: add video processing data model"
```

### Task 2: Validate and store owner video sources privately

**Files:**

- Modify: `next.config.ts`
- Modify: `src/features/catalogue/product-media-input.ts`
- Create: `src/features/catalogue/server/local-video-upload.ts`
- Create: `tests/unit/catalogue/product-media-input.test.ts`

- [ ] **Step 1: Write failing parser tests**

```ts
it.each(['clip.mov', 'clip.mp4', 'clip.webm', 'clip.avi', 'clip.mkv', 'clip.3gp'])(
  'accepts common video file %s under 250 MB',
  (name) => expect(parseAddProductVideoForm(videoForm(name, 1024))).toMatchObject({ success: true }),
);

it('rejects a 250 MB plus one byte video', () => {
  expect(parseAddProductVideoForm(videoForm('clip.mov', 250 * 1024 * 1024 + 1))).toMatchObject({ success: false });
});
```

- [ ] **Step 2: Run parser tests red**

Run: `pnpm vitest run tests/unit/catalogue/product-media-input.test.ts --maxWorkers=1`

Expected: FAIL because video parser/form field does not exist.

- [ ] **Step 3: Add bounded input parsing and request configuration**

```ts
const acceptedVideoExtensions = new Set(['mp4', 'mov', 'webm', 'avi', 'mkv', '3gp']);
const MAX_VIDEO_BYTES = 250 * 1024 * 1024;

export const parseAddProductVideoForm = (formData: FormData) => {
  // validate productId, caption and altText with existing bounds
  // require `video`, a permitted extension/MIME hint, and <= MAX_VIDEO_BYTES
};
```

Set `experimental.serverActions.bodySizeLimit` to `'270mb'` in `next.config.ts`; this admits a 250 MiB video plus multipart form metadata. Do not change image limits.

- [ ] **Step 4: Implement private source storage**

```ts
const videoSourceDirectory = join(process.cwd(), 'var', 'media-processing', 'sources');

export async function storePrivateVideoSource(file: File) {
  const sourceKey = `video-sources/${randomUUID()}.${safeExtension(file.name)}`;
  const path = getPrivateVideoSourcePath(sourceKey);
  await mkdir(videoSourceDirectory, { recursive: true });
  await writeFile(path, Buffer.from(await file.arrayBuffer()), { flag: 'wx' });
  return { sourceKey, path };
}
```

`getPrivateVideoSourcePath` must reject keys that are not exactly one basename under `video-sources/`. `removePrivateVideoSource` uses that guard before removing a source. This directory must remain outside `public/`.

- [ ] **Step 5: Run green tests and static checks**

Run: `pnpm vitest run tests/unit/catalogue/product-media-input.test.ts --maxWorkers=1 && pnpm typecheck && pnpm lint`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add next.config.ts src/features/catalogue/product-media-input.ts src/features/catalogue/server/local-video-upload.ts tests/unit/catalogue/product-media-input.test.ts
git commit -m "feat: validate private product video uploads"
```

### Task 3: Build FFprobe/FFmpeg conversion without shell injection

**Files:**

- Create: `src/features/catalogue/server/video-processing.ts`
- Modify: `tests/unit/catalogue/video-processing.test.ts`

- [ ] **Step 1: Add failing command tests**

```ts
it('builds H.264/AAC MP4 and WebP poster command arguments without user filenames', () => {
  const commands = buildVideoConversionCommands({ inputPath: '/safe/source.mov', outputPath: '/safe/output.mp4', posterPath: '/safe/poster.webp' });
  expect(commands.transcode).toContain('-c:v');
  expect(commands.transcode).toContain('libx264');
  expect(commands.transcode).toContain('+faststart');
  expect(commands.poster).toContain('-frames:v');
  expect(commands.poster).toContain('1');
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/unit/catalogue/video-processing.test.ts --maxWorkers=1`

Expected: FAIL because command builder does not exist.

- [ ] **Step 3: Implement the process boundary**

```ts
export const buildVideoConversionCommands = ({ inputPath, outputPath, posterPath }: VideoPaths) => ({
  probe: ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', inputPath],
  transcode: ['-y', '-i', inputPath, '-map', '0:v:0', '-map', '0:a?', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', outputPath],
  poster: ['-y', '-ss', '00:00:01', '-i', outputPath, '-frames:v', '1', '-vf', 'scale=1280:-2', '-c:v', 'libwebp', '-quality', '78', posterPath],
});
```

Use `spawnFile('ffprobe', args)` and `spawnFile('ffmpeg', args)`, where `spawnFile` wraps `node:child_process.spawn` with `shell: false`, a fixed timeout, bounded stderr capture, and safe generic errors. Parse duration only after FFprobe exits successfully. Reject missing video streams and duration above 300 seconds. Never use `exec`, `execFile` with a constructed string, or user filenames as public output names.

- [ ] **Step 4: Run green tests**

Run: `pnpm vitest run tests/unit/catalogue/video-processing.test.ts --maxWorkers=1`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/catalogue/server/video-processing.ts tests/unit/catalogue/video-processing.test.ts
git commit -m "feat: add safe product video conversion"
```

### Task 4: Process jobs in one resilient worker

**Files:**

- Create: `src/features/catalogue/server/video-worker.ts`
- Create: `scripts/process-product-videos.ts`
- Create: `tests/unit/catalogue/video-worker.test.ts`
- Modify: `src/app/admin/catalogue/actions.ts`

- [ ] **Step 1: Add job transition tests**

```ts
it('claims one pending job and publishes it only after MP4 and poster exist', async () => {
  await processOneVideoJob(dependencies);
  expect(dependencies.updateMedia).toHaveBeenCalledWith(expect.objectContaining({
    processingStatus: 'READY',
    status: 'PUBLISHED',
  }));
});

it('records a safe failure and removes partial output', async () => {
  await processOneVideoJob(failingDependencies);
  expect(failingDependencies.updateJob).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILED' }));
});
```

- [ ] **Step 2: Run red**

Run: `pnpm vitest run tests/unit/catalogue/video-worker.test.ts --maxWorkers=1`

Expected: FAIL because worker module does not exist.

- [ ] **Step 3: Implement atomic job claim and worker loop**

`processOneVideoJob` must atomically update one `PENDING` job to `PROCESSING` using a transaction/conditional update, increment attempts, and skip work if no job is available. It calls the Task 3 processor, writes generated MP4/WebP to `public/media/uploads/<uuid>.mp4|webp`, updates the linked video `MediaAsset` as rights-approved/public/READY, deletes private source, then calls the existing product-path revalidation helper.

On error, delete partial output, retain no original where cleanup is possible, set job/media `FAILED` with a safe owner message, and never publish the record. `scripts/process-product-videos.ts` loops one job at a time with a five-second idle wait and logs only job IDs/statuses.

- [ ] **Step 4: Add owner upload action**

In `addProductVideo`, call `requireOwnerPageSession`, parse Task 2 data, store source, then transactionally create `MediaAsset { kind: VIDEO, status: DRAFT, processingStatus: PENDING }`, `ProductMedia`, and `MediaProcessingJob`. If DB write fails, remove source. Return “Video uploaded. Processing will begin shortly.” Never mark videos primary.

- [ ] **Step 5: Run green tests and checks**

Run: `pnpm vitest run tests/unit/catalogue/video-worker.test.ts --maxWorkers=1 && pnpm typecheck && pnpm lint`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/catalogue/server/video-worker.ts scripts/process-product-videos.ts src/app/admin/catalogue/actions.ts tests/unit/catalogue/video-worker.test.ts
git commit -m "feat: process product videos in background"
```

### Task 5: Give owners clear image/video management controls

**Files:**

- Modify: `src/components/catalogue/product-media-form.tsx`
- Modify: `src/app/admin/catalogue/[id]/media/page.tsx`
- Modify: `src/app/admin/catalogue/actions.ts`
- Test: `tests/unit/components/catalogue/product-media-form.test.tsx`

- [ ] **Step 1: Write a failing owner-form test**

```tsx
it('shows a distinct video upload form with supported types and processing note', () => {
  render(<ProductMediaForm productId="cm1234567890123456789012" />);
  expect(screen.getByLabelText('Choose video')).toHaveAttribute('accept', expect.stringContaining('.mov'));
  expect(screen.getByText(/processing may take a few minutes/i)).toBeVisible();
});
```

- [ ] **Step 2: Verify red**

Run: `pnpm vitest run tests/unit/components/catalogue/product-media-form.test.tsx --maxWorkers=1`

Expected: FAIL because no video form exists.

- [ ] **Step 3: Implement owner UI**

Keep existing image form untouched. Add a separately labelled `Choose video` form with `accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska,video/3gpp,.mp4,.mov,.webm,.avi,.mkv,.3gp"`, 250 MB/max-five-minute guidance, buyer-facing title and accessible description. It submits `addProductVideo`.

Update media-list cards: image cards retain viewer/primary action; video cards show generated poster if ready, a `Video · Processing|Ready|Failed` badge, no `Make primary` action, title editing, carousel order and remove action. A failed job shows its safe error. Update list count from “images” to “media items.”

- [ ] **Step 4: Run green owner UI tests**

Run: `pnpm vitest run tests/unit/components/catalogue/product-media-form.test.tsx --maxWorkers=1`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/catalogue/product-media-form.tsx src/app/admin/catalogue/[id]/media/page.tsx src/app/admin/catalogue/actions.ts tests/unit/components/catalogue/product-media-form.test.tsx
git commit -m "feat: manage product video uploads"
```

### Task 6: Render a fast mixed product gallery for buyers

**Files:**

- Modify: `src/features/catalogue/server/public-catalogue.ts`
- Modify: `src/app/(public)/products/[slug]/page.tsx`
- Modify: `src/components/catalogue/product-image-carousel.tsx`
- Modify: `src/components/catalogue/product-image-carousel.module.css`
- Modify: `tests/unit/components/catalogue/product-image-carousel.test.tsx`

- [ ] **Step 1: Write failing mixed-gallery tests**

```tsx
it('shows a ready video poster and fetches the video only after play', () => {
  render(<ProductImageCarousel images={[image]} media={[video]} />);
  expect(screen.getByRole('button', { name: /play mill scale yard video/i })).toBeVisible();
  expect(screen.queryByRole('video')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /play mill scale yard video/i }));
  expect(screen.getByRole('video')).toHaveAttribute('preload', 'none');
});
```

- [ ] **Step 2: Run red**

Run: `pnpm vitest run tests/unit/components/catalogue/product-image-carousel.test.tsx --maxWorkers=1`

Expected: FAIL because the component accepts image-only slides.

- [ ] **Step 3: Use a discriminated slide type**

```ts
export type ProductGallerySlide =
  | { kind: 'IMAGE'; alt: string; caption: string | null; src: string }
  | { kind: 'VIDEO'; alt: string; caption: string | null; poster: string; src: string };
```

The product server page maps only approved/public slides. Image slides retain `ManagedImage`. Video slides begin as a poster/play button. On button press, render `<video controls playsInline preload="none">` with only the generated MP4 source. Give it an explicit accessible label. Never autoplay, never preload source, and hide/respect gallery auto rotation while video is active. Preserve pause/resume, reduced-motion and 24px indicator targets.

- [ ] **Step 4: Add responsive video CSS**

Use the existing fixed gallery frame and `object-fit: cover` poster. Video controls must remain above captions and 44px play target. At phone widths, retain existing media height cap and title caption region.

- [ ] **Step 5: Run green UI tests and build checks**

Run: `pnpm vitest run tests/unit/components/catalogue/product-image-carousel.test.tsx --maxWorkers=1 && pnpm typecheck && pnpm lint`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/catalogue/server/public-catalogue.ts src/app/(public)/products/[slug]/page.tsx src/components/catalogue/product-image-carousel.tsx src/components/catalogue/product-image-carousel.module.css tests/unit/components/catalogue/product-image-carousel.test.tsx
git commit -m "feat: play product videos in gallery"
```

### Task 7: Apply the compact mobile type scale

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/app/(public)/products/products.module.css`
- Modify: `src/app/(public)/offers/offers.module.css`
- Test: `tests/unit/app/home-page.test.tsx`

- [ ] **Step 1: Write a narrow-screen regression assertion**

```ts
it('keeps the homepage hero type hook and featured materials landmark intact', async () => {
  render(await HomePage());
  expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'home-title');
  expect(screen.getByRole('list', { name: /featured materials/i })).toBeVisible();
});
```

- [ ] **Step 2: Run red only if the assertion does not already exist**

Run: `pnpm vitest run tests/unit/app/home-page.test.tsx --maxWorkers=1`

Expected: FAIL only for a new missing assertion; do not add a duplicate existing test.

- [ ] **Step 3: Add one phone typography scale**

At `max-width: 575.98px`, set public page hero titles to `clamp(2.35rem, 11vw, 3.4rem)`, public section titles to `clamp(1.85rem, 8vw, 2.55rem)`, hero/card ledes to `1rem/1.55`, card titles to 1.35–1.5rem, phone section spacing to 3.5rem, and safe word wrapping for material names. Scope selectors under public page classes so admin text is unchanged. Do not lower body content below 1rem or reduce button height below 44px.

- [ ] **Step 4: Run green responsive checks**

Run: `pnpm vitest run tests/unit/app/home-page.test.tsx --maxWorkers=1 && pnpm lint && pnpm format:check`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/(public)/products/products.module.css src/app/(public)/offers/offers.module.css tests/unit/app/home-page.test.tsx
git commit -m "style: refine public mobile typography"
```

### Task 8: Install worker operations and release safely

**Files:**

- Create: `deploy/systemd/shreenathji-product-video-worker.service`
- Modify: `deploy/systemd/shreenathji-trade-links.service`
- Create/Modify: `deploy/README.md`

- [ ] **Step 1: Add the worker service definition**

```ini
[Service]
Type=simple
User=shreenathji
Group=shreenathji
WorkingDirectory=/var/www/shreenathji-trade-links
Environment=NODE_ENV=production
EnvironmentFile=/var/www/shreenathji-trade-links/.env
ExecStart=/usr/bin/pnpm exec tsx scripts/process-product-videos.ts
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=full
ReadWritePaths=/var/www/shreenathji-trade-links/public/media/uploads /var/www/shreenathji-trade-links/var/media-processing
```

- [ ] **Step 2: Update web service writable paths**

Add `/var/www/shreenathji-trade-links/var/media-processing` to the web service `ReadWritePaths`, so owner uploads can write only private sources and worker output remains restricted.

- [ ] **Step 3: Document exact server release commands**

Document: install `ffmpeg`, create `var/media-processing/sources` owned by `shreenathji`, copy/enable the worker unit, `systemctl daemon-reload`, `pnpm prisma migrate deploy`, restart web+worker, inspect `systemctl status`, inspect `journalctl`, and verify Nginx never maps the private directory.

- [ ] **Step 4: Run complete verification on Node 24**

Run: `pnpm prisma:validate && pnpm test -- --maxWorkers=1 && pnpm typecheck && pnpm lint && pnpm format:check && pnpm build`

Expected: all checks pass with the database available.

- [ ] **Step 5: Run release smoke checks**

Use Playwright CLI at 390×844 and desktop to check: compact headings/no horizontal overflow, product image gallery, product video poster/play control, paused carousel and mobile hamburger. Upload a sample MOV/MP4 as owner; verify job status becomes Ready, MP4/poster are served, source is removed, and product cards do not fetch video before product detail play.

- [ ] **Step 6: Commit and deploy**

```bash
git add deploy docs
git commit -m "ops: run product video worker"
git push origin HEAD:main
ssh shreenathji-deploy@200.234.46.65 'sudo /usr/local/sbin/deploy-shreenathji-trade-links'
```

Verify production HTTP health, HTTPS product detail video playback, worker service status, and migration status before reporting release completion.
