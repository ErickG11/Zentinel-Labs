'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { REDUCED_MOTION_QUERY } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { shouldRender3D } from './render-3d';
import { SentinelFallback } from './sentinel-fallback';

const SentinelScene = dynamic(() => import('@/components/three/sentinel-scene'), {
  ssr: false,
  loading: () => <SentinelFallback />,
});

const detectWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
};

// Capacidades del dispositivo: no cambian durante la sesión, sin suscripción
const subscribeNever = (): (() => void) => () => undefined;
const getUse3DServer = (): boolean => false;
let cachedUse3D: boolean | undefined;
const getUse3D = (): boolean => {
  cachedUse3D ??= shouldRender3D({
    reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
    webgl: detectWebGL(),
    cores: navigator.hardwareConcurrency,
  });
  return cachedUse3D;
};

export function HeroVisual({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const use3D = useSyncExternalStore(subscribeNever, getUse3D, getUse3DServer);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      data-hero-visual=""
      aria-hidden
      className={cn('pointer-events-none', className)}
    >
      {use3D ? <SentinelScene active={inView} /> : <SentinelFallback />}
    </div>
  );
}
