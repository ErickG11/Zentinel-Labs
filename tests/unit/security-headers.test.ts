import { describe, expect, it } from 'vitest';
import { securityHeaders } from '@/lib/security/headers';

const headers = Object.fromEntries(
  securityHeaders.map(({ key, value }) => [key.toLowerCase(), value]),
);

describe('securityHeaders', () => {
  it('enforces HTTPS for two years with preload', () => {
    expect(headers['strict-transport-security']).toBe(
      'max-age=63072000; includeSubDomains; preload',
    );
  });

  it('prevents MIME sniffing and framing', () => {
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
  });

  it('limits referrer leakage and isolates the browsing context', () => {
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['cross-origin-opener-policy']).toBe('same-origin');
  });

  it('disables powerful browser features', () => {
    for (const feature of ['camera=()', 'microphone=()', 'geolocation=()', 'payment=()']) {
      expect(headers['permissions-policy']).toContain(feature);
    }
  });

  it('does not define the CSP (it is per-request, built in the proxy)', () => {
    expect(headers['content-security-policy']).toBeUndefined();
  });
});
