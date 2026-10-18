'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useSmoothScroll } from '@/components/providers/smooth-scroll-provider';
import { NAV_SECTIONS, SECTION_IDS } from '@/content/navigation';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { LocaleSwitch } from './locale-switch';
import { SectionLink } from './section-link';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export const MOBILE_MENU_ID = 'mobile-menu';

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const t = useTranslations('Nav');
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    if (!open) return;
    stop();
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      start();
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose, stop, start]);

  const items = [...NAV_SECTIONS, SECTION_IDS.contact];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id={MOBILE_MENU_ID}
          className="fixed inset-0 z-40 flex flex-col justify-between bg-page px-6 pt-28 pb-10 md:hidden"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        >
          <nav>
            <ul className="flex flex-col gap-2">
              {items.map((id, index) => (
                <li key={id} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 + index * 0.06 }}
                  >
                    <SectionLink
                      id={id}
                      onNavigate={onClose}
                      className="block font-display text-5xl font-semibold tracking-tight"
                    >
                      {t(id)}
                    </SectionLink>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>
          <LocaleSwitch />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
