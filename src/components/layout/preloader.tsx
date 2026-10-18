'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useSmoothScroll } from '@/components/providers/smooth-scroll-provider';
import { gsap } from '@/lib/gsap';
import { markIntroDone } from '@/lib/intro';

const COUNT_DURATION = 1.6;

export function Preloader() {
  const t = useTranslations('Preloader');
  const rootRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const scroll = useSmoothScroll();
  const scrollRef = useRef(scroll);

  useEffect(() => {
    scrollRef.current = scroll;
  }, [scroll]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (document.documentElement.dataset.intro !== 'play') {
      markIntroDone();
      return;
    }

    const lock = scrollRef.current;
    lock.stop();
    const counter = { value: 0 };
    const timeline = gsap.timeline({
      onComplete: () => {
        lock.start();
        markIntroDone();
      },
    });
    timeline
      .to(counter, {
        value: 100,
        duration: COUNT_DURATION,
        ease: 'power3.inOut',
        onUpdate: () => setCount(Math.round(counter.value)),
      })
      .to(root.querySelectorAll('[data-preloader-fade]'), { opacity: 0, duration: 0.3 })
      .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' });

    return () => {
      timeline.kill();
      lock.start();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-preloader=""
      role="status"
      aria-label={t('label')}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-page p-6 sm:p-10"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <p data-preloader-fade="" className="font-display text-lg font-semibold tracking-tight">
        zentinel_labs<span className="text-accent">.</span>
      </p>
      <p
        data-preloader-fade=""
        aria-hidden
        className="self-end font-display text-[22vw] leading-none font-semibold tracking-tighter tabular-nums sm:text-[14vw]"
      >
        {count}
      </p>
    </div>
  );
}
