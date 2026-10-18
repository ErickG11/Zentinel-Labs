'use client';

import { useRef } from 'react';
import type { CounterStat } from '@/content/stats';
import { gsap, useGSAP } from '@/lib/gsap';
import { MOTION_OK_QUERY } from '@/lib/motion';
import { formatCount } from '@/lib/numbers';

export function Counter({ stat }: { stat: CounterStat }) {
  const valueRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const element = valueRef.current;
      if (!element) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const counter = { value: 0 };
        gsap.fromTo(
          counter,
          { value: 0 },
          {
            value: stat.value,
            duration: 1.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 85%', once: true },
            onUpdate: () => {
              element.textContent = formatCount(counter.value);
            },
          },
        );
      });
    },
    { scope: valueRef, dependencies: [stat.value] },
  );

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-6">
      <p className="font-display text-6xl font-semibold tracking-tighter sm:text-7xl">
        {stat.prefix}
        <span ref={valueRef} data-counter="" className="tabular-nums">
          {formatCount(stat.value)}
        </span>
        {stat.suffix}
      </p>
      <p className="text-muted">{stat.label}</p>
    </div>
  );
}
