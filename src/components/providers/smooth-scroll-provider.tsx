'use client';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { REDUCED_MOTION_QUERY } from '@/lib/motion';

interface SmoothScrollApi {
  scrollTo: (target: string | number) => void;
  stop: () => void;
  start: () => void;
}

const NAVBAR_OFFSET = -96;

const nativeScrollTo = (target: string | number): void => {
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
    return;
  }
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
};

const SmoothScrollContext = createContext<SmoothScrollApi>({
  scrollTo: nativeScrollTo,
  stop: () => undefined,
  start: () => undefined,
});

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number): void => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Al cambiar de página: ir al hash si viene uno (p. ej. /es#contact), si no, arriba
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    const hash = window.location.hash;
    if (hash) {
      requestAnimationFrame(() => lenis.scrollTo(hash, { offset: NAVBAR_OFFSET }));
      return;
    }
    lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  const api = useMemo<SmoothScrollApi>(
    () => ({
      scrollTo: (target) => {
        const lenis = lenisRef.current;
        if (lenis) lenis.scrollTo(target, { offset: NAVBAR_OFFSET });
        else nativeScrollTo(target);
      },
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [],
  );

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}

export const useSmoothScroll = (): SmoothScrollApi => useContext(SmoothScrollContext);
