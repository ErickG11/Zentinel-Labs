'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, type RefObject } from 'react';
import { useSmoothScroll } from '@/components/providers/smooth-scroll-provider';
import { NAV_SECTIONS, SECTION_IDS } from '@/content/navigation';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { LocaleSwitch } from './locale-switch';
import { SectionLink } from './section-link';
import { ThemeToggle } from './theme-toggle';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}

export const MOBILE_MENU_ID = 'mobile-menu';

const FOCUSABLE = 'a[href], button:not([disabled])';
// Zonas de la pagina que quedan inertes mientras el menu esta abierto
const BACKGROUND_SELECTOR = 'main, footer';

const getFocusables = (root: HTMLElement | null, toggle: HTMLElement | null): HTMLElement[] => {
  const inside = root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
  // El boton de la cabecera (cerrar) forma parte del ciclo de foco
  return toggle ? [...inside, toggle] : inside;
};

export function MobileMenu({ open, onClose, toggleRef }: MobileMenuProps) {
  const t = useTranslations('Nav');
  const { stop, start } = useSmoothScroll();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    stop();
    const background = Array.from(document.querySelectorAll<HTMLElement>(BACKGROUND_SELECTOR));
    background.forEach((element) => element.setAttribute('inert', ''));
    dialogRef.current?.querySelector<HTMLElement>('nav a')?.focus({ preventScroll: true });

    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = getFocusables(dialogRef.current, toggleRef.current);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !focusables.includes(active as HTMLElement))) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !focusables.includes(active as HTMLElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      start();
      background.forEach((element) => element.removeAttribute('inert'));
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose, stop, start, toggleRef]);

  const items = [...NAV_SECTIONS, SECTION_IDS.contact];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={dialogRef}
          id={MOBILE_MENU_ID}
          role="dialog"
          aria-modal="true"
          aria-label={t('menuTitle')}
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
          <div className="flex flex-wrap items-center gap-3">
            <LocaleSwitch />
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
