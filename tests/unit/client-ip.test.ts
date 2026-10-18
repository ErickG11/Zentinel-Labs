import { describe, expect, it } from 'vitest';
import { getClientIp } from '@/server/security/client-ip';
import {
  CONTACT_LIMIT,
  CONTACT_UNKNOWN_LIMIT,
  contactRateKey,
} from '@/server/security/rate-limit-policy';

const all = {
  'cf-connecting-ip': '203.0.113.9',
  'x-vercel-forwarded-for': '203.0.113.8',
  'x-real-ip': '198.51.100.2',
  'x-forwarded-for': '203.0.113.7, 10.0.0.1',
};

describe('getClientIp', () => {
  it('ignores every proxy header by default and in none mode', () => {
    expect(getClientIp(new Headers(all))).toBe('unknown');
    expect(getClientIp(new Headers(all), 'none')).toBe('unknown');
  });

  it('vercel reads x-vercel-forwarded-for first, then x-real-ip', () => {
    expect(getClientIp(new Headers(all), 'vercel')).toBe('203.0.113.8');
    expect(getClientIp(new Headers({ 'x-real-ip': '198.51.100.2' }), 'vercel')).toBe(
      '198.51.100.2',
    );
  });

  it('cloudflare reads only cf-connecting-ip', () => {
    expect(getClientIp(new Headers(all), 'cloudflare')).toBe('203.0.113.9');
    expect(getClientIp(new Headers({ 'x-real-ip': '198.51.100.2' }), 'cloudflare')).toBe('unknown');
  });

  it('other uses the rightmost x-forwarded-for entry', () => {
    expect(getClientIp(new Headers(all), 'other')).toBe('10.0.0.1');
    expect(
      getClientIp(new Headers({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' }), 'other'),
    ).toBe('3.3.3.3');
  });

  it('ignores a spoofed cf-connecting-ip outside cloudflare mode', () => {
    const spoofed = new Headers({ 'cf-connecting-ip': '6.6.6.6' });
    expect(getClientIp(spoofed, 'vercel')).toBe('unknown');
    expect(getClientIp(spoofed, 'other')).toBe('unknown');
    expect(getClientIp(spoofed, 'none')).toBe('unknown');
  });

  it('discards invalid candidates and accepts IPv6', () => {
    expect(getClientIp(new Headers({ 'cf-connecting-ip': 'not-an-ip' }), 'cloudflare')).toBe(
      'unknown',
    );
    expect(getClientIp(new Headers({ 'x-forwarded-for': '1.1.1.1, garbage' }), 'other')).toBe(
      'unknown',
    );
    expect(getClientIp(new Headers({ 'x-real-ip': '2001:db8::1' }), 'vercel')).toBe('2001:db8::1');
  });
});

describe('contactRateKey', () => {
  it('uses 5/hour per known ip', () => {
    expect(contactRateKey('203.0.113.9')).toEqual({
      key: 'contact:203.0.113.9',
      limit: CONTACT_LIMIT,
    });
    expect(CONTACT_LIMIT).toBe(5);
  });

  it('uses a separate, more generous shared bucket for unknown ips', () => {
    const rate = contactRateKey('unknown');
    expect(rate.key).toBe('contact:unknown');
    expect(rate.limit).toBe(CONTACT_UNKNOWN_LIMIT);
    expect(CONTACT_UNKNOWN_LIMIT).toBe(30);
  });
});
