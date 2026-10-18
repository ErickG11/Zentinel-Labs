import { describe, expect, it } from 'vitest';
import { classifyHref } from '@/components/ui/button';

describe('classifyHref', () => {
  it('detects in-page anchors', () => {
    expect(classifyHref('#contact')).toBe('anchor');
  });

  it('detects internal routes', () => {
    expect(classifyHref('/proyectos/pan-de-vida')).toBe('internal');
  });

  it('detects external links, mail and phone', () => {
    expect(classifyHref('https://wa.me/593000000000')).toBe('external');
    expect(classifyHref('mailto:hola@example.com')).toBe('external');
    expect(classifyHref('tel:+593000000000')).toBe('external');
  });
});
