'use client';

import { useRef } from 'react';
import type { Service } from '@/content/services';
import { gsap, useGSAP } from '@/lib/gsap';
import { MOTION_OK_QUERY } from '@/lib/motion';
import { ServiceIllustration } from './service-illustrations';

const STACK_TOP_REM = 7;
const STACK_STEP_REM = 1.75;

export function ServicesStack({ services }: { services: Service[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;
      const cards = gsap.utils.toArray<HTMLElement>('[data-service-card]', list);
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        cards.forEach((card, index) => {
          const next = cards[index + 1];
          if (!next) return;
          gsap.to(card, {
            scale: 0.92,
            opacity: 0.45,
            ease: 'none',
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: `top ${(STACK_TOP_REM + (index + 1) * STACK_STEP_REM) * 16}px`,
              scrub: true,
            },
          });
        });
      });
    },
    { scope: listRef },
  );

  return (
    <ol ref={listRef} className="mt-16 flex flex-col gap-8">
      {services.map((service, index) => (
        <li
          key={service.id}
          className="sticky"
          style={{ top: `${STACK_TOP_REM + index * STACK_STEP_REM}rem` }}
        >
          <article
            data-service-card=""
            className="grid origin-top gap-10 rounded-3xl bg-page/80 p-8 glass sm:p-12 md:grid-cols-[1.2fr_1fr] md:items-center"
          >
            <div className="flex flex-col gap-6">
              <span className="font-mono text-sm text-muted">{service.number}</span>
              <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {service.title}
              </h3>
              <p className="text-lg text-pretty text-muted">{service.description}</p>
              <ul className="flex flex-wrap gap-2">
                {service.deliverables.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border px-3 py-1.5 font-mono text-xs text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center md:justify-end">
              <ServiceIllustration id={service.id} />
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}
