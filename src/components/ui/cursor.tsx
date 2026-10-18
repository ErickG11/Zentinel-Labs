'use client';

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FINE_POINTER_QUERY, REDUCED_MOTION_QUERY } from '@/lib/motion';

type CursorMode = 'default' | 'link' | 'text';

interface CursorState {
  mode: CursorMode;
  label: string | null;
}

const RING_SIZE: Record<CursorMode, { width: number; height: number }> = {
  default: { width: 36, height: 36 },
  link: { width: 84, height: 84 },
  text: { width: 3, height: 32 },
};

const resolveCursorState = (target: EventTarget | null): CursorState => {
  if (!(target instanceof Element)) return { mode: 'default', label: null };
  const tagged = target.closest<HTMLElement>('[data-cursor]');
  if (tagged) {
    const mode = tagged.dataset.cursor === 'text' ? 'text' : 'link';
    return { mode, label: tagged.dataset.cursorLabel ?? null };
  }
  if (target.closest('a, button, [role="button"], label, summary')) {
    return { mode: 'link', label: null };
  }
  if (target.closest('p, h1, h2, h3, li')) return { mode: 'text', label: null };
  return { mode: 'default', label: null };
};

export function Cursor() {
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const enabled = finePointer && !reducedMotion;

  const [state, setState] = useState<CursorState>({ mode: 'default', label: null });
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    const handleMove = (event: PointerEvent): void => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const handleOver = (event: PointerEvent): void => setState(resolveCursorState(event.target));
    const handleLeave = (): void => setVisible(false);

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerover', handleOver);
    document.addEventListener('pointerleave', handleLeave);
    return () => {
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerover', handleOver);
      document.removeEventListener('pointerleave', handleLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = RING_SIZE[state.mode];

  return (
    <div
      aria-hidden
      data-custom-cursor=""
      className="pointer-events-none fixed inset-0 z-[90] mix-blend-difference"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="absolute top-0 left-0 grid place-items-center rounded-full border border-white"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: size.width,
          height: size.height,
          backgroundColor: state.mode === 'default' ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,1)',
          borderRadius: state.mode === 'text' ? 2 : 999,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {state.label ? (
          <span className="font-mono text-[10px] tracking-widest text-black uppercase">
            {state.label}
          </span>
        ) : null}
      </motion.div>
      <motion.div
        className="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-white"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: state.mode === 'default' ? 1 : 0 }}
      />
    </div>
  );
}
