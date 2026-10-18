'use client';

import { motion } from 'motion/react';
import type { JSX } from 'react';
import type { ServiceId } from '@/content/services';
import { EASE_OUT_EXPO } from '@/lib/motion';

const viewport = { once: true, margin: '-120px' } as const;

function BrowserIllustration() {
  const blocks = [
    { x: 16, y: 40, w: 120, h: 14 },
    { x: 16, y: 62, w: 180, h: 8 },
    { x: 16, y: 76, w: 150, h: 8 },
    { x: 16, y: 100, w: 64, h: 20 },
    { x: 150, y: 96, w: 98, h: 64 },
  ];
  return (
    <svg viewBox="0 0 264 176" className="h-full w-full" fill="none">
      <rect
        x="1"
        y="1"
        width="262"
        height="174"
        rx="12"
        className="stroke-border"
        strokeWidth="2"
      />
      <line x1="1" y1="26" x2="263" y2="26" className="stroke-border" strokeWidth="2" />
      {[14, 26, 38].map((cx) => (
        <circle key={cx} cx={cx} cy="13.5" r="3.5" className="fill-ink/20" />
      ))}
      {blocks.map((block, index) => (
        <motion.rect
          key={index}
          {...{ x: block.x, y: block.y, width: block.w, height: block.h }}
          rx="4"
          className="fill-ink/15"
          initial={{ opacity: 0, x: block.x - 12 }}
          whileInView={{ opacity: 1, x: block.x }}
          viewport={viewport}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.1 + index * 0.08 }}
        />
      ))}
    </svg>
  );
}

function DashboardIllustration() {
  const bars = [40, 72, 56, 96, 80, 120, 104];
  return (
    <svg viewBox="0 0 264 176" className="h-full w-full" fill="none">
      <rect
        x="1"
        y="1"
        width="262"
        height="174"
        rx="12"
        className="stroke-border"
        strokeWidth="2"
      />
      <rect x="12" y="12" width="52" height="152" rx="6" className="fill-ink/10" />
      {bars.map((height, index) => (
        <motion.rect
          key={index}
          x={80 + index * 24}
          y={156 - height}
          width="14"
          height={height}
          rx="3"
          className="fill-ink/25"
          style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={viewport}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.1 + index * 0.06 }}
        />
      ))}
    </svg>
  );
}

function StoreIllustration() {
  const cards = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 264 176" className="h-full w-full" fill="none">
      <rect
        x="1"
        y="1"
        width="262"
        height="174"
        rx="12"
        className="stroke-border"
        strokeWidth="2"
      />
      {cards.map((card) => {
        const x = 14 + (card % 3) * 82;
        const y = 14 + Math.floor(card / 3) * 80;
        return (
          <motion.g
            key={card}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.1 + card * 0.07 }}
          >
            <rect x={x} y={y} width="72" height="44" rx="6" className="fill-ink/12" />
            <rect x={x} y={y + 52} width="48" height="6" rx="3" className="fill-ink/20" />
            <rect x={x} y={y + 62} width="28" height="6" rx="3" className="fill-ink/30" />
          </motion.g>
        );
      })}
    </svg>
  );
}

const ILLUSTRATIONS: Record<ServiceId, () => JSX.Element> = {
  web: BrowserIllustration,
  webapp: DashboardIllustration,
  ecommerce: StoreIllustration,
};

export function ServiceIllustration({ id }: { id: ServiceId }) {
  const Illustration = ILLUSTRATIONS[id];
  return (
    <div aria-hidden className="aspect-[3/2] w-full max-w-sm">
      <Illustration />
    </div>
  );
}
