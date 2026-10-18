'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/hooks/use-theme';

// Ambos iconos siempre montados; la clase html.light decide cuál se ve (sin parpadeo al hidratar)
const ICON_BASE =
  'absolute h-4 w-4 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none';

export function ThemeToggle() {
  const t = useTranslations('ThemeToggle');
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t('label')}
      className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full text-ink glass transition-transform hover:scale-105"
    >
      <Moon
        aria-hidden
        className={`${ICON_BASE} scale-100 rotate-0 opacity-100 in-[.light]:scale-50 in-[.light]:rotate-90 in-[.light]:opacity-0`}
      />
      <Sun
        aria-hidden
        className={`${ICON_BASE} scale-50 -rotate-90 opacity-0 in-[.light]:scale-100 in-[.light]:rotate-0 in-[.light]:opacity-100`}
      />
    </button>
  );
}
