'use client';

import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { TECH_STACK } from '@/content/tech-stack';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { MOTION_OK_QUERY } from '@/lib/motion';

const BASE_DURATION = 32;

export function TechTicker() {
  const t = useTranslations('Ticker');
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const loop = gsap.to(track, {
          xPercent: -50,
          duration: BASE_DURATION,
          ease: 'none',
          repeat: -1,
        });
        // Margen para poder reproducir hacia atrás sin llegar al inicio
        loop.totalTime(loop.duration() * 100);

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const direction = self.direction;
            const boost = Math.min(Math.abs(self.getVelocity()) / 400, 4);
            gsap.to(loop, {
              timeScale: direction * (1 + boost),
              duration: 0.2,
              overwrite: true,
              onComplete: () => {
                gsap.to(loop, { timeScale: direction, duration: 1.2, ease: 'power3.out' });
              },
            });
          },
        });
      });
    },
    { scope: sectionRef },
  );

  const items = [...TECH_STACK, ...TECH_STACK];

  return (
    <section
      ref={sectionRef}
      aria-label={t('label')}
      className="relative overflow-hidden border-y border-border py-6"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-page to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-page to-transparent" />
      <ul ref={trackRef} className="flex w-max">
        {items.map((tech, index) => (
          <li
            key={`${tech}-${index}`}
            aria-hidden={index >= TECH_STACK.length}
            className="flex items-center gap-10 px-10 font-display text-2xl font-medium tracking-tight whitespace-nowrap text-muted sm:text-3xl"
          >
            {tech}
            <span aria-hidden className="font-mono text-base text-ink/30">
              /
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
