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

  it('treats protocol-relative URLs as external', () => {
    expect(classifyHref('//host.com')).toBe('external');
  });

  it('treats the empty string as external (documented fallback)', () => {
    expect(classifyHref('')).toBe('external');
  });

  it('classifies #a as anchor and /x as internal', () => {
    expect(classifyHref('#a')).toBe('anchor');
    expect(classifyHref('/x')).toBe('internal');
  });
});
