import { describe, expect, it } from 'vitest';
import { pickLocale } from '@/content/types';
import { NAV_SECTIONS, SECTION_IDS, sectionHref } from '@/content/navigation';

describe('pickLocale', () => {
  it('returns the value for the requested locale', () => {
    expect(pickLocale({ es: 'Hola', en: 'Hello' }, 'en')).toBe('Hello');
  });
});

describe('navigation', () => {
  it('only lists known section ids in the menu', () => {
    const known: string[] = Object.values(SECTION_IDS);
    expect(NAV_SECTIONS.every((id) => known.includes(id))).toBe(true);
  });
});

describe('sectionHref', () => {
  it('uses a bare anchor on the home page', () => {
    expect(sectionHref('contact', { isHome: true, locale: 'es' })).toBe('#contact');
  });

  it('goes back to the localized home from other pages', () => {
    expect(sectionHref('contact', { isHome: false, locale: 'en' })).toBe('/en#contact');
  });
});
