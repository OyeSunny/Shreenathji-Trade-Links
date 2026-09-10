# Product video and mobile typography design

## Goal

Let the owner add product demonstration videos from common phone and desktop formats without making the public B2B catalogue slow, while refining phone typography so headings and content fit naturally on small screens.

## Decisions

- The owner uploads video files directly through the existing product media workspace.
- Accept common container formats: MP4, MOV, WebM, AVI, MKV and 3GP. The uploader uses both MIME type and extension as an initial hint; FFprobe is the authoritative media validation step.
- Maximum upload: 250 MB. Maximum duration: five minutes.
- Files are processed asynchronously. The upload request stores a private temporary source and creates a persistent job; it must not wait for an FFmpeg conversion.
- A single owner-visible status is shown for each video: Processing, Ready or Failed. Failed files include a safe actionable message and can be removed/replaced.
- Every valid source is converted with FFmpeg into one public MP4 using H.264 video and AAC audio, with web streaming metadata moved to the start of the file. This is the reliable playback output for iPhone/Safari, Android and desktop browsers.
- FFmpeg also creates a WebP poster frame. The temporary original is deleted only after both MP4 and poster are successfully written. No source file is kept after success.
- Product media becomes a mixed ordered gallery. Images keep their current watermark and WebP pipeline. Videos use their generated poster, visible play control and native HTML video controls; they never autoplay and use `preload="none"`.
- Product catalogue cards remain image-first. A video cannot be chosen as the primary listing-card image, protecting listing speed and layout.
- On public product detail pages, videos participate in the existing gallery sequence. The caption remains the owner-entered variant title; video slides identify themselves as video for assistive technology.
- Product images, homepage images, offers and site content do not gain video support in this release.

## Architecture

### Data

- Extend `MediaAsset` with video poster URL/storage fields and processing status/error fields, plus a `MediaProcessingJob` model with `PENDING`, `PROCESSING`, `READY` and `FAILED` lifecycle timestamps.
- `MediaAsset.kind` uses the existing `VIDEO` value. Existing `ProductMedia` continues to carry order, alt text and buyer-facing variant title for images and videos.
- A video media record remains private/draft until its job completes. Only a ready, rights-approved, published video and generated poster appear in public gallery queries.

### Upload and processing

1. Owner-only product-media upload validates product ID, title, description, allowed extension/MIME hint, 250 MB cap and upload request size.
2. The server writes the untrusted upload to a private temporary directory using a generated name, creates the video media record/job transactionally, then returns Processing.
3. A dedicated VPS systemd worker claims one pending job at a time. It invokes `ffprobe`/`ffmpeg` with argument arrays only, never shell-interpolated names.
4. The worker checks stream presence/duration, transcodes to H.264/AAC MP4, creates the WebP poster, atomically publishes the public files, updates media/job status, deletes the source, and revalidates product routes.
5. Worker failure deletes any partial output, records a safe error, and leaves the owner able to remove/retry by uploading again.

### Public playback

- Gallery uses a discriminated image/video slide model.
- Image slides keep the current responsive WebP rendering, watermark and title caption.
- Video slides render the generated poster and an explicit Play button. Playback is user initiated, controls are native, inline playback is enabled for iPhone, and the source is not fetched until play is requested.
- Reduced motion never starts video playback or gallery autoplay.

## Mobile typography

- Add a narrow-screen type scale rather than one-off heading overrides: page hero headings `clamp(2.35rem, 11vw, 3.4rem)`, section headings `clamp(1.85rem, 8vw, 2.55rem)`, card titles 1.35–1.5rem, lede 1rem with 1.55 line height.
- Keep body text at least 1rem. Constrain heading line length and use `overflow-wrap: anywhere` only for long product names/technical strings.
- Reduce phone-only section gaps and card padding while preserving 44px tap targets. Tablet and desktop typography remains unchanged.
- Apply the scale to homepage, products, offers, company, contact and quote page heroes; do not alter the admin typography in this release.

## Security and operations

- Owner auth remains mandatory for upload and management actions.
- Generated names, private temp storage, size/duration caps, FFprobe verification and argument-array process spawning protect the worker from user-controlled files/names.
- Nginx continues to serve only generated public MP4/WebP output; temporary sources are never web-accessible.
- Add FFmpeg/FFprobe to the deployment prerequisites, an owner-only worker systemd unit, and health/log guidance in deployment documentation.
- 250 MB videos use disk while processing; monitor the existing 100 GB VPS disk and retain weekly backups.

## Acceptance criteria

- An owner can upload a typical iPhone MOV, Android MP4 and supported desktop video; each progresses from Processing to Ready and becomes one H.264/AAC MP4 plus WebP poster.
- A corrupt, unsupported, oversized or over-five-minute upload is rejected or marked Failed without exposing a source file or partial public output.
- Product image/video ordering, captions, deletion and primary image behaviour remain correct.
- Buyers can play video on iPhone and desktop from the product detail gallery; product cards and homepage do not preload video.
- At 360px and 390px, public headings do not dominate the screen, long names do not cause horizontal overflow, and all CTAs remain visible.
- Unit/integration tests cover input validation, job state transitions, FFmpeg command construction and public filtering; browser checks cover user-initiated video playback and mobile layout.
- Node 24 production build, typecheck, lint, formatting and full tests pass before deployment.

## Non-goals

- No video uploads for homepage hero, offers, company pages or reviews.
- No livestreaming, video analytics, captions/subtitles, editing suite, video CDN or public video downloads.
- No automatic migration or conversion of existing image media.
