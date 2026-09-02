'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type SectionRevealProps = {
  children: ReactNode;
  delay?: 'none' | 'short';
};

export function SectionReveal({
  children,
  delay = 'none',
}: SectionRevealProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const Observer = globalThis.IntersectionObserver;

    if (!Observer) {
      const fallbackTimer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(fallbackTimer);
    }

    const observer = new Observer(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`section-reveal section-reveal--${delay}${isVisible ? ' is-visible' : ''}`}
      ref={sectionRef}
    >
      {children}
    </div>
  );
}
