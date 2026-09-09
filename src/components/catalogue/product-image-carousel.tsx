'use client';

import { useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import CarouselItem from 'react-bootstrap/CarouselItem';

import styles from './product-image-carousel.module.css';

export const PRODUCT_IMAGE_CAROUSEL_INTERVAL = 5500;

export type ProductCarouselImage = {
  alt: string;
  src: string;
};

type ProductImageCarouselProps = {
  className?: string;
  images: ProductCarouselImage[];
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export function ProductImageCarousel({
  className,
  images,
}: ProductImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = images.length > 1;
  const selectedIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));

  useEffect(() => {
    if (!hasMultipleImages) return;

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, PRODUCT_IMAGE_CAROUSEL_INTERVAL);

    return () => window.clearInterval(timer);
  }, [hasMultipleImages, images.length]);

  if (images.length === 0) return null;

  if (!hasMultipleImages) {
    const image = images[0];

    // Product imagery is managed by the owner CMS and constrained before it
    // reaches this display component.
    return (
      <div
        className={joinClassNames(styles.root, styles.singleRoot, className)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={image.alt} className={styles.image} src={image.src} />
        <span aria-hidden="true" className={styles.watermark}>
          Shreenathji Trade Links
        </span>
      </div>
    );
  }

  const selectPrevious = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
  };
  const selectNext = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
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
        onSelect={(selected) => setActiveIndex(selected)}
        touch
      >
        {images.map((image) => (
          <CarouselItem key={image.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={image.alt} className={styles.image} src={image.src} />
            <span aria-hidden="true" className={styles.watermark}>
              Shreenathji Trade Links
            </span>
          </CarouselItem>
        ))}
      </Carousel>

      <div className={styles.controls}>
        <button
          aria-label="Previous image"
          className={styles.arrow}
          onClick={selectPrevious}
          type="button"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div aria-label="Choose product image" className={styles.indicators}>
          {images.map((image, index) => (
            <button
              aria-current={index === selectedIndex ? 'true' : undefined}
              aria-label={`Show image ${index + 1}`}
              className={styles.indicator}
              key={image.src}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <span className="visually-hidden">{image.alt}</span>
            </button>
          ))}
        </div>
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
