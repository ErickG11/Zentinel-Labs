import { describe, expect, it } from 'vitest';
import { getContactConfig, parseServerEnv } from '@/server/env';

const complete = {
  NODE_ENV: 'production',
  NEXT_PUBLIC_SITE_URL: 'https://zentinel.dev',
  RESEND_API_KEY: 're_123456789',
  CONTACT_TO_EMAIL: 'hola@zentinel.dev',
  CONTACT_FROM_EMAIL: 'Zentinel Labs <web@zentinel.dev>',
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
};

describe('parseServerEnv', () => {
  it('applies defaults when optional values are missing', () => {
    const env = parseServerEnv({});
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
    expect(env.RESEND_API_KEY).toBeUndefined();
  });

  it('treats empty strings as missing', () => {
    expect(parseServerEnv({ CONTACT_TO_EMAIL: '' }).CONTACT_TO_EMAIL).toBeUndefined();
  });

  it('rejects malformed values', () => {
    expect(() => parseServerEnv({ CONTACT_TO_EMAIL: 'not-an-email' })).toThrow(
      /Invalid environment/,
    );
    expect(() => parseServerEnv({ RESEND_API_KEY: 'sk_wrong' })).toThrow(/Invalid environment/);
  });
});

describe('getContactConfig', () => {
  it('returns the config only when every contact variable is present', () => {
    expect(getContactConfig(parseServerEnv(complete))).toEqual({
      resendApiKey: 're_123456789',
      toEmail: 'hola@zentinel.dev',
      fromEmail: 'Zentinel Labs <web@zentinel.dev>',
      turnstileSecret: '1x0000000000000000000000000000000AA',
    });
    expect(getContactConfig(parseServerEnv({ ...complete, RESEND_API_KEY: '' }))).toBeNull();
  });
});
