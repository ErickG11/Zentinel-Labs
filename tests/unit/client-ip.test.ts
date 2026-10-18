import { describe, expect, it } from 'vitest';
import { getClientIp } from '@/server/security/client-ip';

describe('getClientIp', () => {
  it('prefers cf-connecting-ip over every other header', () => {
    const headers = new Headers({
      'cf-connecting-ip': '203.0.113.9',
      'x-vercel-forwarded-for': '203.0.113.8',
      'x-real-ip': '198.51.100.2',
      'x-forwarded-for': '203.0.113.7, 10.0.0.1',
    });
    expect(getClientIp(headers)).toBe('203.0.113.9');
  });

  it('follows the order vercel, x-real-ip, x-forwarded-for', () => {
    expect(
      getClientIp(
        new Headers({ 'x-vercel-forwarded-for': '203.0.113.8', 'x-real-ip': '198.51.100.2' }),
      ),
    ).toBe('203.0.113.8');
    expect(
      getClientIp(new Headers({ 'x-real-ip': '198.51.100.2', 'x-forwarded-for': '203.0.113.7' })),
    ).toBe('198.51.100.2');
    expect(getClientIp(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe(
      '203.0.113.7',
    );
  });

  it('discards invalid candidates and accepts IPv6', () => {
    expect(
      getClientIp(new Headers({ 'cf-connecting-ip': 'not-an-ip', 'x-real-ip': '2001:db8::1' })),
    ).toBe('2001:db8::1');
  });

  it('returns unknown when nothing valid is present', () => {
    expect(getClientIp(new Headers())).toBe('unknown');
    expect(getClientIp(new Headers({ 'x-forwarded-for': 'garbage, 1.1.1.1' }))).toBe('unknown');
  });
});
