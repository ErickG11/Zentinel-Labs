import { describe, expect, it } from 'vitest';
import { buildCsp, type CspOptions } from '@/lib/security/csp';

const parseCsp = (csp: string): Map<string, string[]> =>
  new Map(
    csp
      .split(';')
      .map((directive) => directive.trim())
      .filter(Boolean)
      .map((directive): [string, string[]] => {
        const [name, ...values] = directive.split(/\s+/);
        return [name, values];
      }),
  );

const production: CspOptions = { nonce: 'abc123', isDev: false, upgradeInsecureRequests: true };

describe('buildCsp', () => {
  it('allows scripts only through the request nonce and strict-dynamic', () => {
    const scriptSrc = parseCsp(buildCsp(production)).get('script-src');
    expect(scriptSrc).toContain("'nonce-abc123'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it('adds unsafe-eval only in development', () => {
    const scriptSrc = parseCsp(buildCsp({ ...production, isDev: true })).get('script-src');
    expect(scriptSrc).toContain("'unsafe-eval'");
  });

  it('nonces <style> elements in production and relaxes them in development', () => {
    expect(parseCsp(buildCsp(production)).get('style-src-elem')).toContain("'nonce-abc123'");
    expect(parseCsp(buildCsp({ ...production, isDev: true })).get('style-src-elem')).toContain(
      "'unsafe-inline'",
    );
  });

  it('allows inline style attributes needed by animation libraries', () => {
    expect(parseCsp(buildCsp(production)).get('style-src-attr')).toEqual(["'unsafe-inline'"]);
  });

  it('blocks framing, plugins, base hijacking and foreign form targets', () => {
    const csp = parseCsp(buildCsp(production));
    expect(csp.get('frame-ancestors')).toEqual(["'none'"]);
    expect(csp.get('object-src')).toEqual(["'none'"]);
    expect(csp.get('base-uri')).toEqual(["'self'"]);
    expect(csp.get('form-action')).toEqual(["'self'"]);
    expect(csp.get('default-src')).toEqual(["'self'"]);
  });

  it('allows Cloudflare Turnstile', () => {
    const csp = parseCsp(buildCsp(production));
    expect(csp.get('frame-src')).toContain('https://challenges.cloudflare.com');
    expect(csp.get('script-src')).toContain('https://challenges.cloudflare.com');
  });

  it('adds upgrade-insecure-requests only when requested', () => {
    expect(parseCsp(buildCsp(production)).has('upgrade-insecure-requests')).toBe(true);
    expect(
      parseCsp(buildCsp({ ...production, upgradeInsecureRequests: false })).has(
        'upgrade-insecure-requests',
      ),
    ).toBe(false);
  });
});
