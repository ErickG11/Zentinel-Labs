'use client';

import { useRef } from 'react';
import type { RingStat } from '@/content/stats';
import { gsap, useGSAP } from '@/lib/gsap';
import { MOTION_OK_QUERY } from '@/lib/motion';
import { ringDashOffset } from '@/lib/numbers';

const SIZE = 112;
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ ring, index }: { ring: RingStat; index: number }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const finalOffset = ringDashOffset(ring.level, CIRCUMFERENCE);

  useGSAP(
    () => {
      const circle = circleRef.current;
      if (!circle) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.fromTo(
          circle,
          { strokeDashoffset: CIRCUMFERENCE },
          {
            strokeDashoffset: finalOffset,
            duration: 1.4,
            ease: 'power3.out',
            delay: index * 0.08,
            scrollTrigger: { trigger: circle, start: 'top 80%', once: true },
          },
        );
      });
    },
    { dependencies: [finalOffset, index] },
  );

  return (
    <figure data-ring="" className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth="6"
            className="stroke-border"
          />
          <circle
            ref={circleRef}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className="stroke-ink"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={finalOffset}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-display text-2xl font-semibold">
          {ring.level}
        </span>
      </div>
      <figcaption className="text-center text-sm text-muted">{ring.label}</figcaption>
    </figure>
  );
}
