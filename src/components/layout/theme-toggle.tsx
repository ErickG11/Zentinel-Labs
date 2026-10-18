'use client';

import { Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/hooks/use-theme';

export function ThemeToggle() {
  const t = useTranslations('ThemeToggle');
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t('label')}
      className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full text-ink glass transition-transform hover:scale-105"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="grid place-items-center"
        >
          {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
