'use client';

import Image from 'next/image';
import { useRef } from 'react';
import type { ProjectImage } from '@/content/projects';
import { gsap, useGSAP } from '@/lib/gsap';
import { MOTION_OK_QUERY } from '@/lib/motion';

export function CaseHeroImage({ image }: { image: ProjectImage }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.fromTo(
          imageRef.current,
          { scale: 1.2 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: frameRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
        gsap.fromTo(
          frameRef.current,
          { clipPath: 'inset(12% 8% 12% 8% round 24px)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 24px)',
            ease: 'none',
            scrollTrigger: {
              trigger: frameRef.current,
              start: 'top 90%',
              end: 'top 20%',
              scrub: true,
            },
          },
        );
      });
    },
    { scope: frameRef },
  );

  return (
    <div ref={frameRef} className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl">
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}
