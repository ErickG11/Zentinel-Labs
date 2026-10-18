'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, type PointerEvent, type ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FINE_POINTER_QUERY, REDUCED_MOTION_QUERY } from '@/lib/motion';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

const SPRING = { stiffness: 220, damping: 18, mass: 0.4 };

export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);
  const enabled = finePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) {
      x.set(0);
      y.set(0);
    }
  }, [enabled, x, y]);

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>): void => {
    if (!enabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = (): void => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      className={className ?? 'inline-flex'}
      style={{ x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  );
}
