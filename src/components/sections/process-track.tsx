'use client';

import { useRef } from 'react';
import type { ProcessStep } from '@/content/process';
import { gsap, useGSAP } from '@/lib/gsap';

const DESKTOP_MOTION = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';

export function ProcessTrack({ steps }: { steps: ProcessStep[] }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const pin = pinRef.current;
      const track = trackRef.current;
      const line = lineRef.current;
      if (!pin || !track || !line) return;

      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        const distance = (): number => track.scrollWidth - pin.clientWidth;
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pin,
            start: 'center center',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        timeline
          .to(track, { x: () => -distance() }, 0)
          .fromTo(line, { scaleX: 0 }, { scaleX: 1 }, 0);
      });
    },
    { scope: pinRef },
  );

  return (
    <div ref={pinRef} className="relative mt-16 overflow-hidden md:overflow-visible">
      <div aria-hidden className="absolute top-0 left-0 hidden h-px w-full bg-border md:block">
        <div ref={lineRef} className="h-full w-full origin-left bg-ink" />
      </div>
      <ol ref={trackRef} className="flex flex-col gap-6 md:w-max md:flex-row md:pt-12">
        {steps.map((step) => (
          <li
            key={step.number}
            className="flex flex-col gap-5 rounded-3xl p-8 glass md:w-[26rem] md:shrink-0"
          >
            <span className="font-display text-6xl font-semibold tracking-tighter text-ink/15">
              {step.number}
            </span>
            <h3 className="font-display text-2xl font-semibold tracking-tight">{step.title}</h3>
            <p className="text-pretty text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
