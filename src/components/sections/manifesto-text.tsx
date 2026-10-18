'use client';

import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { MOTION_OK_QUERY } from '@/lib/motion';

export function ManifestoText({ children }: { children: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const split = SplitText.create(element, { type: 'words' });
        gsap.fromTo(
          split.words,
          { opacity: 0.12 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: element, start: 'top 80%', end: 'bottom 45%', scrub: true },
          },
        );
        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <p
      ref={ref}
      className="font-display text-3xl leading-[1.15] font-medium tracking-tight text-balance sm:text-5xl"
    >
      {children}
    </p>
  );
}
