'use client';

import { ArrowRight, Check, LoaderCircle, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT_EXPO } from '@/lib/motion';

export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

interface SubmitButtonProps {
  status: SubmitStatus;
  labels: Record<SubmitStatus, string>;
}

const ICONS = {
  idle: ArrowRight,
  loading: LoaderCircle,
  success: Check,
  error: RotateCcw,
} as const;

export function SubmitButton({ status, labels }: SubmitButtonProps) {
  const Icon = ICONS[status];
  return (
    <button
      type="submit"
      disabled={status === 'loading'}
      data-cursor="link"
      className="group relative inline-flex h-14 min-w-56 items-center justify-center overflow-hidden rounded-full border border-ink bg-ink px-8 font-medium text-page transition-colors duration-500 hover:bg-page hover:text-ink disabled:cursor-wait"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          className="inline-flex items-center gap-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
        >
          {labels[status]}
          <Icon className={status === 'loading' ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
