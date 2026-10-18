'use client';

import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { MOTION_OK_QUERY } from '@/lib/motion';

const TRACKING_EM = -0.03;
const MEASURE_SIZE = 200;
const WORDS = ['ZENTINEL', 'LABS'];

export function FooterWordmark() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Ajuste determinista: la tinta de "ZENTINEL" ocupa exactamente el ancho del contenedor
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const lines = Array.from(wrapper.querySelectorAll<HTMLElement>('[data-wordmark-line]'));
    const fit = (): void => {
      const context = document.createElement('canvas').getContext('2d');
      const first = lines[0];
      if (!context || !first) return;
      const style = getComputedStyle(first);
      context.font = `${style.fontWeight} ${MEASURE_SIZE}px ${style.fontFamily}`;
      const width = wrapper.clientWidth;
      const main = context.measureText(WORDS[0] ?? '');
      const ink = main.actualBoundingBoxLeft + main.actualBoundingBoxRight;
      const gaps = (WORDS[0]?.length ?? 1) - 1;
      const perEm = ink / MEASURE_SIZE + gaps * TRACKING_EM;
      const size = width / perEm;
      wrapper.style.setProperty('--wordmark-size', `${size}px`);
      lines.forEach((line, i) => {
        const metrics = context.measureText(WORDS[i] ?? '');
        line.style.marginLeft = `${(metrics.actualBoundingBoxLeft / MEASURE_SIZE) * size}px`;
      });
    };
    void document.fonts.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

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
    <div ref={wrapperRef} aria-hidden className="mx-auto max-w-6xl overflow-hidden select-none">
      {WORDS.map((word) => (
        <span
          key={word}
          data-wordmark-line=""
          className="block font-display text-[length:var(--wordmark-size,calc((100vw-3rem)*0.2))] leading-[0.82] font-semibold tracking-[-0.03em] whitespace-nowrap"
        >
          {word}
        </span>
      ))}
    </div>
  );
}
