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

  const previousPathRef = useRef(pathname);

  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    let teardown: (() => void) | null = null;

    const create = (): void => {
      if (teardown) return;
      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
      lenisRef.current = lenis;
      lenis.on('scroll', ScrollTrigger.update);

      const onTick = (time: number): void => lenis.raf(time * 1000);
      gsap.ticker.add(onTick);
      // Intencional: sin suavizado de lag para sincronizar con Lenis; el provider vive toda la app
      gsap.ticker.lagSmoothing(0);

      teardown = () => {
        gsap.ticker.remove(onTick);
        lenis.destroy();
        lenisRef.current = null;
        teardown = null;
      };
    };

    const sync = (): void => {
      if (mql.matches) teardown?.();
      else create();
    };

    sync();
    mql.addEventListener('change', sync);

    return () => {
      mql.removeEventListener('change', sync);
      teardown?.();
    };
  }, []);

  // Al cambiar de página con hash (p. ej. /es#contact): ir a la sección. Next ya gestiona el scroll nativo
  useEffect(() => {
    if (previousPathRef.current === pathname) return;
    previousPathRef.current = pathname;
    const hash = window.location.hash;
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      lenisRef.current?.scrollTo(hash, { offset: NAVBAR_OFFSET });
    });
    return () => cancelAnimationFrame(frame);
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
