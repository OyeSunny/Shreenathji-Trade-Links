# Mobile-first catalogue performance and WebP uploads

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the public catalogue feel deliberately mobile-first and materially faster on phones, while converting every owner-uploaded site image into a safe, optimized WebP asset.

**Architecture:** Keep the existing Next.js, Bootstrap, Prisma and local `public/media/uploads` architecture. Centralize image normalization in the one server-only upload pipeline so product and homepage uploads receive identical validation and WebP output. Keep the desktop information architecture, while changing only the narrow-screen presentation to compact heroes, consistent image frames and touch-native product/offer rails. Render approved local assets with Next Image so responsive image sizing, lazy loading and format negotiation work automatically.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Sharp, Bootstrap 5, React-Bootstrap, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-10-mobile-first-catalogue-design.md`

**Global constraints:**

- Do not add a CDN, image host, carousel library or JavaScript swipe library.
- Accept JPEG/JPG, PNG, WebP and AVIF uploads up to the existing 10 MB limit; reject invalid signatures and unsafe images as today.
- Store only the transformed WebP result. Never retain the original upload, EXIF, GPS or camera metadata.
- Product uploads keep the existing server-side `SHREENATHJI TRADE LINKS` watermark. Homepage/hero uploads never receive a watermark.
- Preserve existing absolute `/media/...` seed assets and existing approved external media records; WebP conversion applies to new local uploads.
- Preserve all public routes, product links, enquiry behaviour, accessibility controls and reduced-motion behaviour.
- Use `apply_patch` for edits. Run Node 24 verification on the VPS when local Node 20 prevents full Vitest execution.

## File structure

```text
src/features/catalogue/server/local-image-upload.ts              # validate, normalize, write .webp
src/features/catalogue/server/product-image-watermark.ts         # watermark before WebP encode
src/features/catalogue/server/local-image-upload.test.ts         # upload/format/error tests
src/components/media/managed-image.tsx                           # local /media image rendering with explicit sizes
src/components/media/managed-image.test.tsx                      # lazy/priority/alt rendering tests
next.config.ts                                                   # local image patterns and modern output formats
src/app/(public)/page.tsx                                        # prioritised hero and mobile featured-product rail
src/app/(public)/page.module.css                                 # homepage-only rail/hero mobile styles if needed
src/app/(public)/products/page.tsx                               # sized catalogue images and compact mobile cards
src/app/(public)/products/products.module.css                    # catalogue mobile layout rules
src/app/(public)/offers/page.tsx                                 # sized offer images and mobile offer rail
src/app/(public)/offers/offers.module.css                        # offer mobile layout rules
src/app/(public)/offers/[slug]/page.tsx                          # sized offer detail media
src/components/catalogue/product-image-carousel.tsx              # sized/lazy product detail media
src/app/globals.css                                              # shared compact hero and safe responsive defaults
tests/e2e/public-mobile.spec.ts                                  # phone viewport interaction/layout checks
```

## Task 1: Prove the current upload contract, then normalize every new upload to WebP

**Files:**

- Create: `src/features/catalogue/server/local-image-upload.test.ts`
- Modify: `src/features/catalogue/server/local-image-upload.ts`
- Modify: `src/features/catalogue/server/product-image-watermark.ts`
- Modify: `src/features/catalogue/product-media-input.ts`

1. Write focused unit coverage against the server upload seam. Mock filesystem writes and UUID generation so the test can inspect the emitted file name, public URL and output bytes without writing into `public/media`.
2. Test each accepted input signature (JPEG, PNG, WebP and AVIF) resolves to exactly one generated `uploads/<uuid>.webp` storage key and `/media/uploads/<uuid>.webp` public URL.
3. Use Sharp metadata in the test to assert the stored buffer is `webp`, and assert the original input extension is not used in the returned display/storage data. Include one product upload assertion that the watermark composite path is invoked before encoding.
4. Retain tests for rejected fake files, invalid/mismatched signatures and the 10 MB limit. Assert decode/transform errors produce the existing safe `InvalidUploadedImageError` instead of an internal error.
5. In `storeLocalImage`, keep the current file-size and magic-byte validation first. Then build Sharp from the validated bytes with `failOn: 'error'`, `limitInputPixels: 64_000_000`, apply rotation from EXIF, and encode `.webp({ quality: 78, effort: 4 })` without calling `withMetadata`.
6. For product media, keep `watermarkProductImage` as the first processing stage, then hand its resulting pixels to the common WebP encode step. For generic (`watermark: false`) hero/content uploads, skip the watermark but still re-encode to WebP.
7. Replace extension-dependent output naming with one generated `.webp` file and `image/webp` media metadata. Preserve the human-readable original `fileName` only as a label, converting the suffix to `.webp` so the owner is never told an unavailable source format is stored.
8. Update accepted-file help/error text in `product-media-input.ts` only where it currently promises an original format will be kept; it should state “JPEG, PNG, WebP or AVIF accepted — stored as optimized WebP.”
9. Run the focused test, `pnpm typecheck`, lint and Prettier check.

## Task 2: Create one intentional local-media rendering path

**Files:**

- Create: `src/components/media/managed-image.tsx`
- Create: `src/components/media/managed-image.test.tsx`
- Modify: `next.config.ts`
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/app/(public)/products/page.tsx`
- Modify: `src/app/(public)/offers/page.tsx`
- Modify: `src/app/(public)/offers/[slug]/page.tsx`
- Modify: `src/components/catalogue/product-image-carousel.tsx`

1. Add a small `ManagedImage` wrapper around `next/image` only for local `/media/...` URLs. Its public props are `src`, `alt`, `className`, `sizes`, `priority?: boolean` and a required aspect-ratio-safe width/height or `fill` contract. It must keep semantic `alt` text and never manufacture one.
2. The wrapper must fall back to a native `<img loading="lazy" decoding="async">` for approved `http:`/`https:` legacy media. This avoids breaking existing IndiaMART/external records while keeping the optimized local upload path correct.
3. Configure `next.config.ts` for only local `/media/**` optimization and WebP/AVIF response formats; do not wildcard remote hosts. Keep static local images valid in development and production.
4. Replace public raw `<img>` usages with `ManagedImage` wherever the source comes from `getPublicImageUrl`:
   - hero image: first slide `priority`, remaining slides lazy;
   - homepage feature cards;
   - product listing cards;
   - offers listing/detail cards;
   - product carousel, where the active initial slide is prioritized and later slides are lazy.
5. Give each context a truthful `sizes` value: hero `(max-width: 991px) 100vw, 100vw`; three-column cards `(max-width: 575px) 86vw, (max-width: 991px) 50vw, 33vw`; detail image `(max-width: 991px) 100vw, 58vw`.
6. Preserve existing image placeholders and product-image variant labels. Do not change data fetching or media-rights filtering.
7. Add component tests for local Image rendering, external fallback, `priority` and meaningful `alt` forwarding. Run focused tests, typecheck, lint and Prettier.

## Task 3: Make the home page compact and thumb-friendly on phones

**Files:**

- Modify: `src/app/(public)/page.tsx`
- Modify: `src/app/globals.css`
- Create only if CSS isolation is clearer: `src/app/(public)/page.module.css`
- Modify/create: `tests/e2e/public-mobile.spec.ts`

1. At 575.98px and below, change hero sizing from `clamp(43rem, 78svh, 50rem)` to a compact stable range: `min-height: 31rem; height: min(70svh, 39rem)`. Keep the slide frame constant so images and copy never make the hero jump.
2. Reduce mobile heading and lede proportions so the primary action and at least one featured-material card become visible without a full-screen hero. Preserve readable minimum 16px body text and current contrast.
3. Keep the hero slide image `object-fit: cover`, but anchor it deliberately for compact view, hide desktop-only arrow controls on touch as currently done, and retain accessible indicators.
4. Replace the mobile-only featured-products Bootstrap stacking with a horizontal CSS scroll-snap rail: `grid-auto-flow: column`, `grid-auto-columns: minmax(16rem, 86vw)`, `overflow-x: auto`, `scroll-snap-type: x mandatory`, and each card `scroll-snap-align: start`. Keep the current desktop row/grid unchanged above 575.98px.
5. Add a visible but quiet “Swipe for more materials” affordance on touch widths only. It is supplemental text, not an inaccessible custom control.
6. Ensure cards maintain a fixed 16:10 image frame, price panel placement and equal content rhythm; no stretching of image/content based on the underlying file dimensions.
7. Add Playwright mobile checks at 390×844: one hero viewport is compact, rail has horizontal overflow, two cards are reachable by horizontal scroll, menu works, and no document-level horizontal overflow is introduced.

## Task 4: Apply the same mobile density rules to catalogue and offers

**Files:**

- Modify: `src/app/(public)/products/page.tsx`
- Modify: `src/app/(public)/products/products.module.css`
- Modify: `src/app/(public)/offers/page.tsx`
- Modify: `src/app/(public)/offers/offers.module.css`
- Modify: `src/app/(public)/offers/[slug]/page.tsx`
- Modify: `src/app/(public)/products/[slug]/page.tsx`
- Modify: `src/components/catalogue/product-image-carousel.tsx`
- Modify: `src/components/catalogue/product-image-carousel.module.css`

1. Keep `/products` as a comfortable single-column sequence at phone width (not a forced desktop grid): reduce vertical section padding, tighten card body spacing and retain full-width tap targets. At 576–991px use two equal columns; preserve the current three-column desktop catalogue.
2. On `/offers`, use the same touch-native horizontal scroll-snap rail on phone widths only. Its card width must match the homepage rail and desktop remains the current grid.
3. Preserve product/offer image aspect ratios with `aspect-ratio` and `object-fit: cover`; add `min-width: 0` and text-wrap protection on cards so long material names cannot create horizontal scrolling.
4. On product and offer detail routes, preserve the current carousel controls but cap mobile media height, place variant titles inside the stable media caption region, and keep manual/carousel keyboard controls usable.
5. Confirm price blocks, CTA buttons, quote selections and offer terms remain visible and clickable on 360px, 390px, 768px and desktop widths.
6. Extend Playwright checks to visit products, a product detail, offers and an offer detail at phone width; assert no horizontal document overflow and an actionable CTA per screen.

## Task 5: Regression, performance and deployment verification

**Files:**

- Modify if required by real test evidence: `tests/e2e/public-mobile.spec.ts`
- Modify if required by public image rendering evidence: `tests/unit/...`
- No database migration expected.

1. Run `pnpm prisma:validate`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, focused upload/media tests, and the complete Vitest suite on the VPS Node 24 environment if the local Node 20 worker failure remains.
2. Run the public Playwright suite against the local/staging app at 360×800, 390×844, 768×1024 and desktop. Include mobile public navigation, hero, product rail, catalogue, offers and quote CTA coverage.
3. Upload one valid JPEG through product media and one valid PNG through homepage content in a non-production test record. Confirm each is stored and served as `.webp`, product output contains its watermark, hero output does not, and no original JPEG/PNG is left in the upload directory.
4. Measure the homepage response and browser network after the change. Verify only the first hero slide is high priority and off-screen images are lazy; report before/after image payload observations rather than inventing a speed number.
5. Build production with `pnpm build`, inspect the public homepage/products/offers/admin responsive layouts manually, then commit the feature as one clean change set. Push only after the verified build and deploy through the existing VPS script.
