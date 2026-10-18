'use client';

import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { NAV_SECTIONS, SECTION_IDS } from '@/content/navigation';
import { Link } from '@/i18n/navigation';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { LocaleSwitch } from './locale-switch';
import { Logo } from './logo';
import { MOBILE_MENU_ID, MobileMenu } from './mobile-menu';
import { ScrollProgress } from './scroll-progress';
import { SectionLink, useSectionHref } from './section-link';
import { ThemeToggle } from './theme-toggle';

const HIDE_AFTER = 160;

export function Navbar() {
  const t = useTranslations('Nav');
  const { scrollY } = useScroll();
  const contactHref = useSectionHref(SECTION_IDS.contact);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(current > 20);
    setHidden(current > HIDE_AFTER && current > previous && !menuOpen);
  });

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <ScrollProgress />
      <motion.header
        className={cn(
          'fixed inset-x-0 top-0 z-50 px-4 transition-[padding] duration-500',
          scrolled ? 'py-3' : 'py-6',
        )}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: hidden ? '-120%' : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      >
        <nav
          className={cn(
            'mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-full px-4 py-2 transition-[background-color,box-shadow,border-color] duration-500 sm:px-5',
            scrolled ? 'shadow-lg shadow-black/20 glass' : 'border border-transparent',
          )}
        >
          <Link href="/" aria-label={t('home')} className="shrink-0">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-7 text-sm text-muted md:flex">
            {NAV_SECTIONS.map((id) => (
              <li key={id}>
                <SectionLink id={id} className="transition-colors duration-300 hover:text-ink">
                  {t(id)}
                </SectionLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LocaleSwitch />
            </div>
            <ThemeToggle />
            <div className="hidden sm:block">
              <Button href={contactHref} size="md">
                {t('cta')}
              </Button>
            </div>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full glass md:hidden"
              aria-expanded={menuOpen}
              aria-controls={MOBILE_MENU_ID}
              aria-label={menuOpen ? t('close') : t('menu')}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden className="relative block h-3 w-4">
                <span
                  className={cn(
                    'absolute left-0 h-px w-4 bg-ink transition-transform duration-500',
                    menuOpen ? 'top-1.5 rotate-45' : 'top-0',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 h-px w-4 bg-ink transition-transform duration-500',
                    menuOpen ? 'top-1.5 -rotate-45' : 'top-3',
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
