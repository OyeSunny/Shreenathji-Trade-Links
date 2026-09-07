'use client';

import { useCallback, useEffect, useState } from 'react';

import styles from './buyer-feedback-carousel.module.css';

export type PublicCustomerReview = {
  id: string;
  reviewerName: string;
  companyName: string | null;
  location: string | null;
  productName: string | null;
  rating: number;
  comment: string;
  reviewedOn: Date | null;
  featured: boolean;
};

const demoReviews = [
  {
    id: 'demo-specification',
    reviewerName: 'Preview buyer',
    companyName: null,
    location: null,
    productName: 'Specification first',
    rating: 5,
    comment:
      'The enquiry summary made it easy to compare grade, quantity, and delivery requirements before a call.',
  },
  {
    id: 'demo-dispatch',
    reviewerName: 'Preview buyer',
    companyName: null,
    location: null,
    productName: 'Dispatch detail',
    rating: 5,
    comment:
      'The preview shows how packing and dispatch details can be kept clear while the requirement is being confirmed.',
  },
  {
    id: 'demo-export',
    reviewerName: 'Preview buyer',
    companyName: null,
    location: null,
    productName: 'Export context',
    rating: 5,
    comment:
      'The example reflects the kind of destination and documentation detail an international enquiry may need.',
  },
] satisfies Array<Omit<PublicCustomerReview, 'reviewedOn' | 'featured'>>;

type BuyerFeedbackCarouselProps = {
  reviews: PublicCustomerReview[];
};

/**
 * A fixed review stage: one owner-approved review is presented at a time so
 * changing quote lengths never move the following homepage section.
 */
export function BuyerFeedbackCarousel({ reviews }: BuyerFeedbackCarouselProps) {
  const isPreview = reviews.length === 0;
  const items: PublicCustomerReview[] = isPreview
    ? demoReviews.map((review) => ({
        ...review,
        featured: false,
        reviewedOn: null,
      }))
    : reviews;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  const moveTo = useCallback(
    (nextIndex: number) => {
      if (items.length < 2 || isFading) return;

      const normalizedIndex = (nextIndex + items.length) % items.length;
      if (reduceMotion) {
        setActiveIndex(normalizedIndex);
        return;
      }

      setIsFading(true);
      window.setTimeout(() => {
        setActiveIndex(normalizedIndex);
        setIsFading(false);
      }, 220);
    },
    [isFading, items.length, reduceMotion],
  );

  useEffect(() => {
    if (isPaused || reduceMotion || items.length < 2) return;

    const interval = window.setInterval(() => moveTo(activeIndex + 1), 6800);
    return () => window.clearInterval(interval);
  }, [activeIndex, isPaused, items.length, moveTo, reduceMotion]);

  const visibleIndex = activeIndex % items.length;
  const activeReview = items[visibleIndex] ?? items[0];
  const attribution = [activeReview.companyName, activeReview.location]
    .filter(Boolean)
    .join(' · ');

  return (
    <section
      aria-labelledby="buyer-feedback-heading"
      className={styles.section}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setIsPaused(false);
      }}
      onFocusCapture={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.inner}>
        <header className={styles.heading}>
          <div>
            <p className={styles.kicker}>Buyer feedback</p>
            <h2 id="buyer-feedback-heading">
              {isPreview
                ? 'Buyer feedback preview.'
                : 'What approved buyers share.'}
            </h2>
          </div>
          {isPreview ? (
            <p className={styles.notice}>
              Demo content — replace before publishing
            </p>
          ) : (
            <p className={styles.approval}>Published with buyer approval</p>
          )}
        </header>

        <div className={styles.stage}>
          <article
            aria-atomic="true"
            aria-live="polite"
            className={`${styles.review} ${isFading ? styles.reviewLeaving : ''}`}
          >
            <div className={styles.reviewTopline}>
              <span className={styles.index} aria-hidden="true">
                {String(visibleIndex + 1).padStart(2, '0')} /{' '}
                {String(items.length).padStart(2, '0')}
              </span>
              <span
                aria-label={`${activeReview.rating} out of 5 stars`}
                className={styles.stars}
              >
                {'★'.repeat(activeReview.rating)}
                <span aria-hidden="true" className={styles.emptyStars}>
                  {'★'.repeat(5 - activeReview.rating)}
                </span>
              </span>
            </div>

            <blockquote className={styles.quote}>
              <p>“{activeReview.comment}”</p>
            </blockquote>

            <footer className={styles.footer}>
              <div>
                <p className={styles.reviewer}>{activeReview.reviewerName}</p>
                {attribution ? (
                  <p className={styles.attribution}>{attribution}</p>
                ) : null}
              </div>
              {activeReview.productName ? (
                <p className={styles.material}>{activeReview.productName}</p>
              ) : null}
            </footer>
          </article>
        </div>

        <div className={styles.controls}>
          <p className={styles.hint}>
            {items.length > 1
              ? 'Changes automatically · pause on hover'
              : 'One approved buyer review'}
          </p>
          {items.length > 1 ? (
            <div className={styles.buttons}>
              <button
                aria-label="Show previous buyer feedback"
                className={styles.button}
                onClick={() => moveTo(visibleIndex - 1)}
                type="button"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                aria-label="Show next buyer feedback"
                className={styles.button}
                onClick={() => moveTo(visibleIndex + 1)}
                type="button"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
