'use client';

import NextLink from 'next/link';
import { useLocale } from 'next-intl';
import type { MouseEvent, ReactNode } from 'react';
import { useSmoothScroll } from '@/components/providers/smooth-scroll-provider';
import { sectionHref, type SectionId } from '@/content/navigation';
import { usePathname } from '@/i18n/navigation';

interface SectionLinkProps {
  id: SectionId;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}

export const useSectionHref = (id: SectionId): string => {
  const locale = useLocale();
  const isHome = usePathname() === '/';
  return sectionHref(id, { isHome, locale });
};

export function SectionLink({ id, children, className, onNavigate }: SectionLinkProps) {
  const href = useSectionHref(id);
  const { scrollTo } = useSmoothScroll();

  if (!href.startsWith('#')) {
    return (
      <NextLink href={href} className={className} onClick={onNavigate}>
        {children}
      </NextLink>
    );
  }

  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    onNavigate?.();
    scrollTo(href);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
