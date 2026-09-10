'use client';

import { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import CarouselItem from 'react-bootstrap/CarouselItem';

import { ManagedImage } from '@/components/media/managed-image';
import styles from './product-image-carousel.module.css';

export const PRODUCT_IMAGE_CAROUSEL_INTERVAL = 5500;

export type ProductCarouselImage = {
  alt: string;
  caption?: string | null;
  kind?: 'IMAGE';
  src: string;
};

export type ProductCarouselVideo = {
  alt: string;
  caption?: string | null;
  kind: 'VIDEO';
  posterUrl: string;
  src: string;
};

export type ProductCarouselMedia = ProductCarouselImage | ProductCarouselVideo;

type ProductImageCarouselProps = {
  className?: string;
  images: ProductCarouselMedia[];
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function getReducedMotionPreference() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

export function ProductImageCarousel({
  className,
  images,
}: ProductImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [announceCaption, setAnnounceCaption] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    getReducedMotionPreference,
  );
  const hasMultipleImages = images.length > 1;
  const selectedIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));

  useEffect(() => {
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!motionQuery) return;

    const updatePreference = () => setPrefersReducedMotion(motionQuery.matches);
    motionQuery.addEventListener?.('change', updatePreference);

    return () => motionQuery.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!hasMultipleImages || prefersReducedMotion) return;
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
      setAnnounceCaption(false);
    }, PRODUCT_IMAGE_CAROUSEL_INTERVAL);

    return () => window.clearInterval(timer);
  }, [hasMultipleImages, images.length, isPaused, prefersReducedMotion]);

  if (images.length === 0) return null;

  const activeImage = images[selectedIndex];
  const activeCaption =
    activeImage.caption ?? `Image ${selectedIndex + 1} of ${images.length}`;

  if (!hasMultipleImages) {
    const image = images[0];

    // Product imagery is managed by the owner CMS and constrained before it
    // reaches this display component.
    return (
      <div
        className={joinClassNames(styles.root, styles.singleRoot, className)}
      >
        {image.kind === 'VIDEO' ? (
          <video
            aria-label={image.alt}
            className={styles.video}
            controls
            playsInline
            poster={image.posterUrl}
            preload="none"
          >
            <source src={image.src} type="video/mp4" />
          </video>
        ) : (
          <>
            <ManagedImage
              alt={image.alt}
              className={styles.image}
              priority
              sizes="(max-width: 991px) 100vw, 58vw"
              src={image.src}
            />
            <span aria-hidden="true" className={styles.watermark}>
              Shreenathji Trade Links
            </span>
          </>
        )}
        <p aria-atomic="true" className={styles.caption}>
          {activeCaption}
        </p>
      </div>
    );
  }

  const selectImage = (index: number) => {
    setActiveIndex(index);
    setAnnounceCaption(true);
    setIsPaused(true);
  };

  const selectPrevious = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
    setAnnounceCaption(true);
    setIsPaused(true);
  };
  const selectNext = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
    setAnnounceCaption(true);
    setIsPaused(true);
  };

  return (
    <div
      aria-label="Product images"
      className={joinClassNames(styles.root, className)}
      role="region"
    >
      <Carousel
        activeIndex={selectedIndex}
        controls={false}
        indicators={false}
        interval={null}
        onSelect={selectImage}
        touch
      >
        {images.map((image) => (
          <CarouselItem key={image.src}>
            {image.kind === 'VIDEO' ? (
              <video
                aria-label={image.alt}
                className={styles.video}
                controls
                playsInline
                poster={image.posterUrl}
                preload="none"
              >
                <source src={image.src} type="video/mp4" />
              </video>
            ) : (
              <>
                <ManagedImage
                  alt={image.alt}
                  className={styles.image}
                  priority={selectedIndex === 0 && image === images[0]}
                  sizes="(max-width: 991px) 100vw, 58vw"
                  src={image.src}
                />
                <span aria-hidden="true" className={styles.watermark}>
                  Shreenathji Trade Links
                </span>
              </>
            )}
          </CarouselItem>
        ))}
      </Carousel>

      <p
        aria-atomic="true"
        className={styles.caption}
        role={announceCaption ? 'status' : undefined}
      >
        {activeCaption}
      </p>

      <div
        aria-label="Product image controls"
        className={styles.controls}
        role="group"
      >
        <button
          aria-label="Previous image"
          className={styles.arrow}
          onClick={selectPrevious}
          type="button"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div
          aria-label="Choose product image"
          className={styles.indicators}
          role="group"
        >
          {images.map((image, index) => (
            <button
              aria-current={index === selectedIndex ? 'true' : undefined}
              aria-label={`Show image ${index + 1}`}
              className={styles.indicator}
              key={image.src}
              onClick={() => selectImage(index)}
              type="button"
            >
              <span className="visually-hidden">{image.alt}</span>
            </button>
          ))}
        </div>
        {!prefersReducedMotion ? (
          <button
            aria-label={
              isPaused
                ? 'Resume automatic image rotation'
                : 'Pause automatic image rotation'
            }
            className={styles.pause}
            onClick={() => {
              setAnnounceCaption(false);
              setIsPaused((current) => !current);
            }}
            type="button"
          >
            <span aria-hidden="true">{isPaused ? '▶' : 'Ⅱ'}</span>
          </button>
        ) : null}
        <button
          aria-label="Next image"
          className={styles.arrow}
          onClick={selectNext}
          type="button"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
