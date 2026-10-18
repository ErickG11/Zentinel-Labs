'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { MOTION_OK_QUERY } from '@/lib/motion';

export function FooterWordmark() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.fromTo(
          '[data-wordmark-line]',
          { yPercent: 60 },
          {
            yPercent: 0,
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: true,
            },
          },
        );
      });
    },
    { scope: wrapperRef },
  );

  return (
    <div ref={wrapperRef} aria-hidden className="overflow-hidden select-none">
      {['ZENTINEL', 'LABS'].map((word) => (
        <span
          key={word}
          data-wordmark-line=""
          className="block font-display text-[19vw] leading-[0.82] font-semibold tracking-[-0.06em] whitespace-nowrap"
        >
          {word}
        </span>
      ))}
    </div>
  );
}
