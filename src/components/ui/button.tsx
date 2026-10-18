'use client';

import NextLink from 'next/link';
import type { MouseEvent, ReactNode } from 'react';
import { useSmoothScroll } from '@/components/providers/smooth-scroll-provider';
import { cn } from '@/lib/utils';
import { Magnetic } from './magnetic';
import { RollText } from './roll-text';

type HrefKind = 'anchor' | 'internal' | 'external';

export const classifyHref = (href: string): HrefKind => {
  if (href.startsWith('#')) return 'anchor';
  if (href.startsWith('//')) return 'external';
  if (href.startsWith('/')) return 'internal';
  return 'external';
};

interface ButtonProps {
  children: string;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  disabled?: boolean;
  cursorLabel?: string;
  className?: string;
}

const VARIANTS = {
  primary: {
    base: 'bg-ink text-page border-ink',
    fill: 'bg-page',
    hoverText: 'group-hover:text-ink group-focus-visible:text-ink',
  },
  secondary: {
    base: 'glass text-ink',
    fill: 'bg-ink',
    hoverText: 'group-hover:text-page group-focus-visible:text-page',
  },
} as const;

const SIZES = {
  sm: 'h-11 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
} as const;

export function Button({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  cursorLabel,
  className,
}: ButtonProps) {
  const { scrollTo } = useSmoothScroll();
  const styles = VARIANTS[variant];

  const classes = cn(
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border font-medium',
    'transition-colors duration-500 disabled:pointer-events-none disabled:opacity-50',
    styles.base,
    SIZES[size],
    className,
  );

  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 translate-y-full rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none',
          styles.fill,
        )}
      />
      <span
        className={cn(
          'relative inline-flex items-center gap-2 transition-colors duration-500',
          styles.hoverText,
        )}
      >
        <RollText>{children}</RollText>
        {icon ? <span aria-hidden>{icon}</span> : null}
      </span>
    </>
  );

  const cursorProps = { 'data-cursor': 'link', 'data-cursor-label': cursorLabel };

  if (!href) {
    return (
      <Magnetic>
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={classes}
          {...cursorProps}
        >
          {content}
        </button>
      </Magnetic>
    );
  }

  const kind = classifyHref(href);

  if (kind === 'anchor') {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      scrollTo(href);
      onClick?.();
    };
    return (
      <Magnetic>
        <a href={href} onClick={handleClick} className={classes} {...cursorProps}>
          {content}
        </a>
      </Magnetic>
    );
  }

  // Rutas internas: siempre completas y ya localizadas (p. ej. /es#contact, /en/work/x)
  if (kind === 'internal') {
    return (
      <Magnetic>
        <NextLink href={href} onClick={onClick} className={classes} {...cursorProps}>
          {content}
        </NextLink>
      </Magnetic>
    );
  }

  if (/^(mailto|tel):/i.test(href)) {
    return (
      <Magnetic>
        <a href={href} onClick={onClick} className={classes} {...cursorProps}>
          {content}
        </a>
      </Magnetic>
    );
  }

  return (
    <Magnetic>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={classes}
        {...cursorProps}
      >
        {content}
      </a>
    </Magnetic>
  );
}
