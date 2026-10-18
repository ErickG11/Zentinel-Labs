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

  it('accepts http and https', () => {
    expect(classifyHref('http://example.com')).toBe('external');
    expect(classifyHref('HTTPS://example.com')).toBe('external');
  });

  it('rejects protocol-relative URLs', () => {
    expect(classifyHref('//host.com')).toBe('unsafe');
    expect(classifyHref('/\\host.com')).toBe('unsafe');
    expect(classifyHref('/\t/host.com')).toBe('unsafe');
  });

  it('rejects dangerous schemes, including case, whitespace and control-char tricks', () => {
    expect(classifyHref('javascript:alert(1)')).toBe('unsafe');
    expect(classifyHref('JAVASCRIPT:alert(1)')).toBe('unsafe');
    expect(classifyHref('JaVaScRiPt:alert(1)')).toBe('unsafe');
    expect(classifyHref('  javascript:alert(1)')).toBe('unsafe');
    expect(classifyHref('java\tscript:alert(1)')).toBe('unsafe');
    expect(classifyHref('java\nscript:alert(1)')).toBe('unsafe');
    expect(classifyHref('\u0001javascript:alert(1)')).toBe('unsafe');
    expect(classifyHref('data:text/html,<script>alert(1)</script>')).toBe('unsafe');
    expect(classifyHref('DATA:text/html;base64,AAAA')).toBe('unsafe');
    expect(classifyHref('vbscript:x')).toBe('unsafe');
    expect(classifyHref('ftp://example.com')).toBe('unsafe');
  });

  it('rejects the empty string and bare relative paths', () => {
    expect(classifyHref('')).toBe('unsafe');
    expect(classifyHref('foo/bar')).toBe('unsafe');
  });

  it('classifies #a as anchor and /x as internal', () => {
    expect(classifyHref('#a')).toBe('anchor');
    expect(classifyHref('/x')).toBe('internal');
  });
});
