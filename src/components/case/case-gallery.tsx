'use client';

import Image from 'next/image';
import { useRef } from 'react';
import type { ProjectImage } from '@/content/projects';
import { gsap, useGSAP } from '@/lib/gsap';
import { MOTION_OK_QUERY } from '@/lib/motion';

export function CaseGallery({ images }: { images: ProjectImage[] }) {
  const listRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.utils.toArray<HTMLElement>('[data-parallax]', listRef.current).forEach((element) => {
          gsap.fromTo(
            element,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: element.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
        });
      });
    },
    { scope: listRef },
  );

  return (
    <ul ref={listRef} className="grid gap-6 md:grid-cols-2">
      {images.map((image, index) => (
        <li
          key={image.src}
          className={`relative aspect-[16/10] overflow-hidden rounded-3xl ${index === 0 ? 'md:col-span-2' : ''}`}
        >
          <div data-parallax="" className="absolute inset-x-0 -inset-y-[10%]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={
                index === 0 ? '(min-width: 1152px) 1152px, 100vw' : '(min-width: 768px) 50vw, 100vw'
              }
              className="object-cover object-top"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
