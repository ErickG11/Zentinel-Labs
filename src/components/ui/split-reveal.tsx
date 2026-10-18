'use client';

import { useRef, type ReactNode } from 'react';
import { useIntroReady } from '@/hooks/use-intro-ready';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { MOTION_OK_QUERY } from '@/lib/motion';

interface SplitRevealProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  type?: 'lines' | 'chars';
  trigger?: 'scroll' | 'intro';
  delay?: number;
  className?: string;
  id?: string;
}

export function SplitReveal({
  children,
  as: Tag = 'h2',
  type = 'lines',
  trigger = 'scroll',
  delay = 0,
  className,
  id,
}: SplitRevealProps) {
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement>(null);
  const introReady = useIntroReady();
  const ready = trigger === 'scroll' || introReady;

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || !ready) return;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const split = SplitText.create(element, {
          type: type === 'chars' ? 'lines,chars' : 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(element, { visibility: 'visible' });
            return gsap.from(type === 'chars' ? self.chars : self.lines, {
              yPercent: 110,
              duration: type === 'chars' ? 1 : 1.1,
              ease: 'expo.out',
              stagger: type === 'chars' ? 0.018 : 0.09,
              delay,
              scrollTrigger:
                trigger === 'scroll'
                  ? { trigger: element, start: 'top 85%', once: true }
                  : undefined,
            });
          },
        });
        return () => split.revert();
      });
    },
    { dependencies: [ready], scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className} data-split-pending="">
      {children}
    </Tag>
  );
}
