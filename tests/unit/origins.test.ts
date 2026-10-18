import { describe, expect, it } from 'vitest';
import { getServerActionOrigins } from '@/lib/security/origins';

describe('getServerActionOrigins', () => {
  it('returns the host and its www variant for https urls', () => {
    expect(getServerActionOrigins('https://zentinel.dev')).toEqual([
      'zentinel.dev',
      'www.zentinel.dev',
    ]);
    expect(getServerActionOrigins('https://www.zentinel.dev/')).toEqual([
      'zentinel.dev',
      'www.zentinel.dev',
    ]);
  });

  it('keeps the port when present', () => {
    expect(getServerActionOrigins('https://zentinel.dev:8443')).toEqual([
      'zentinel.dev:8443',
      'www.zentinel.dev:8443',
    ]);
  });

  it('returns an empty list for localhost so the default same-origin check applies', () => {
    expect(getServerActionOrigins('http://localhost:3000')).toEqual([]);
    expect(getServerActionOrigins('http://127.0.0.1:3100')).toEqual([]);
  });

  it('returns an empty list for invalid or missing urls', () => {
    expect(getServerActionOrigins('not a url')).toEqual([]);
    expect(getServerActionOrigins('')).toEqual([]);
    expect(getServerActionOrigins(undefined)).toEqual([]);
  });
});
