'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useIntroReady } from '@/hooks/use-intro-ready';
import { EASE_OUT_EXPO } from '@/lib/motion';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  trigger?: 'view' | 'intro';
  as?: 'div' | 'li' | 'article';
  className?: string;
}

const TAGS = { div: motion.div, li: motion.li, article: motion.article } as const;

export function Reveal({
  children,
  delay = 0,
  y = 30,
  trigger = 'view',
  as = 'div',
  className,
}: RevealProps) {
  const introReady = useIntroReady();
  const Tag = TAGS[as];
  const variants = { hidden: { opacity: 0, y }, shown: { opacity: 1, y: 0 } };
  const transition = { duration: 0.9, ease: EASE_OUT_EXPO, delay };

  if (trigger === 'intro') {
    return (
      <Tag
        className={className}
        variants={variants}
        initial="hidden"
        animate={introReady ? 'shown' : 'hidden'}
        transition={transition}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-80px' }}
      transition={transition}
    >
      {children}
    </Tag>
  );
}
