'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { SmoothScrollProvider } from './smooth-scroll-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </MotionConfig>
  );
}
