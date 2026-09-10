# Mobile-first Catalogue Experience Design

## Goal

Make public catalogue pages feel compact, fast, and deliberate on phones without removing product detail, buyer enquiry paths, or owner-managed content.

## Problem evidence

Live production checks showed a homepage response time around 3 seconds, including a 2.8-second time-to-first-byte. The homepage and product listings use raw PNG media files between 1.5 MB and 2.6 MB; the media directory totals approximately 27 MB. On a phone, large decoded images plus tall desktop-first section spacing make the site feel slow and vertically stretched.

## Design direction

Industrial pocket catalogue: dense content rhythm, fixed visual frames, and purposeful horizontal browsing. Hero stays cinematic but compact. Catalogue and offers become quick scan cards. Long content remains accessible on detail pages, not repeated in listing cards.

## Responsive rules

### Public pages, up to 575 px

- Header stays compact and sticky. Primary navigation remains inside existing accessible hamburger drawer.
- Homepage hero uses `min-height: 31rem` and `max-height: 70svh`; it never consumes a full phone screen before buyers see materials.
- Hero image frame stays fixed; slide text has a readable bottom panel. Only first slide gets eager image loading. Other slide media stays lazy-loaded.
- Section vertical spacing drops to 3.5rem. Page heroes use 2.5rem top/bottom padding.
- Catalogue and offer lists use one-column cards with fixed media aspect ratios and a price/CTA baseline. No card becomes taller due to different image dimensions.
- Full mobile rows become horizontally scrollable swipe rails only where items are short, repeated cards: featured products and active offers. Rails use native `overflow-x: auto`, `scroll-snap-type: x mandatory`, and visible first/next card edges. No JavaScript carousel is added for cards.
- Product image and feedback carousels retain existing manual controls and auto-advance only when reduced-motion is not requested.
- Quote panel CTA stays full width but is not fixed/sticky; it must never cover form fields or content.

### Tablet, 576–991 px

- Product and offer listing grids use two columns.
- Page hero blocks use the existing two-column grid only when the lede has room; otherwise stack cleanly.
- Admin drawer remains the existing fixed mobile drawer. Admin tables transform to the existing stacked card/list form where required; no wide overflow is permitted.

### Desktop, 992 px and wider

- Preserve existing layout hierarchy. Mobile compact spacing and rails must not alter desktop grid geometry.

## Performance rules

- Use Next `Image` for website-owned public media, with explicit `sizes`, fixed aspect-ratio containers, `quality={75}`, and responsive output. Avoid hand-written raw `<img>` for homepage, catalogue, and offer card images.
- Use `priority` only for visible first hero media. All other hero slides and card images use native lazy loading.
- Preserve product-media watermark and dynamic owner uploads. Remote/owner-uploaded URLs pass through existing public media URL validation; no image URL is trusted before current approval/publication checks.
- Do not add a new image CDN or paid dependency. Next image optimisation supplies responsive derivatives on the existing VPS.
- Keep original uploaded file for owner zoom and future reprocessing; public list pages request suitable derivatives.

## Scope

- Homepage, products index/detail, offers index/detail, company/contact/quote page hero spacing, public navigation, and admin responsive common styles.
- Public image components and Next image configuration needed for responsive assets.
- Browser checks at 360 px, 390 px, 768 px, and desktop; test slow 4G behaviour by confirming only initial critical hero media loads eagerly.

## Non-goals

- No public checkout, account system, or new product data model.
- No visual redesign of desktop layout.
- No external analytics, image CDN, or additional UI library.

## Acceptance criteria

- At 360 px and 390 px, homepage shows hero, first material cue, and no oversized blank vertical space without excessive scrolling.
- Product and offer cards align despite unequal text and image dimensions.
- Users can swipe featured products/offers with native touch scrolling and retain keyboard access.
- First hero image is responsive; later slides and listing media do not block initial page render.
- No public image 403/404, horizontal viewport overflow, hidden CTA, or broken hamburger menu on tested widths.
- `pnpm typecheck`, `pnpm lint`, focused unit tests, and production build pass on Node 24.
