'use client';

import { MotionConfig } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { SmoothScrollProvider } from './smooth-scroll-provider';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Marca que la app montó: desactiva los fail-safe de CSS
    document.documentElement.dataset.hydrated = '';
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </MotionConfig>
  );
}
