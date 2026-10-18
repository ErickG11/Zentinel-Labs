import { describe, expect, it } from 'vitest';
import { contactSchema } from '@/lib/validation/contact-schema';
import { renderContactEmail } from '@/server/contact/email-template';
import { parseServerEnv } from '@/server/env';
import { InMemoryRateLimiter } from '@/server/security/rate-limiter';

describe('InMemoryRateLimiter key cap', () => {
  it('evicts the oldest keys once the hard cap is reached', async () => {
    const limiter = new InMemoryRateLimiter({ limit: 1, windowMs: 1_000_000, now: () => 0 });
    await limiter.consume('first');
    for (let i = 0; i < 10_000; i += 1) await limiter.consume(`k${i}`);
    // "first" was the oldest entry and has been evicted, so it is allowed again
    expect((await limiter.consume('first')).allowed).toBe(true);
    // a recent key is still tracked and blocked
    expect((await limiter.consume('k9999')).allowed).toBe(false);
  });
});

describe('Turnstile test keys', () => {
  it.each([
    '1x0000000000000000000000000000000AA',
    '2x0000000000000000000000000000000AB',
    '3x0000000000000000000000000000000FF',
  ])('rejects %s in production', (key) => {
    expect(() => parseServerEnv({ NODE_ENV: 'production', TURNSTILE_SECRET_KEY: key })).toThrow(
      /Turnstile test secret/,
    );
  });

  it('allows them in development and test, and real keys in production', () => {
    const key = '1x0000000000000000000000000000000AA';
    expect(
      parseServerEnv({ NODE_ENV: 'development', TURNSTILE_SECRET_KEY: key }).TURNSTILE_SECRET_KEY,
    ).toBe(key);
    expect(
      parseServerEnv({ NODE_ENV: 'test', TURNSTILE_SECRET_KEY: key }).TURNSTILE_SECRET_KEY,
    ).toBe(key);
    const real = '0x4AAAAAAAreal-secret-value';
    expect(
      parseServerEnv({ NODE_ENV: 'production', TURNSTILE_SECRET_KEY: real }).TURNSTILE_SECRET_KEY,
    ).toBe(real);
  });
});

const valid = {
  name: 'Ana Pérez',
  email: 'ana@empresa.com',
  projectType: 'webapp',
  message: 'Necesitamos un sistema de reservas para nuestra clínica.',
  turnstileToken: 'token-123',
};

const messagesFor = (input: unknown): string[] => {
  const result = contactSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('contactSchema hardening', () => {
  it('rejects control characters and line separators in name, company and email', () => {
    expect(messagesFor({ ...valid, name: 'Eve\r\nBcc: x@evil.com' })).toContain('name.min');
    expect(messagesFor({ ...valid, name: 'Eve\u2028Ana' })).toContain('name.min');
    expect(messagesFor({ ...valid, company: 'ACME\nEmail: boss@x.com' })).toContain(
      'company.invalid',
    );
    expect(messagesFor({ ...valid, email: 'a@b.com\nBcc: x@y.com' })).toContain('email.invalid');
  });

  it('returns translation keys (not English defaults) for missing or mistyped fields', () => {
    const messages = messagesFor({
      name: 5,
      email: null,
      projectType: 1,
      message: [],
      turnstileToken: {},
    });
    expect(messages.length).toBeGreaterThan(0);
    for (const message of messages) expect(message).toMatch(/^[a-zA-Z]+\.[a-zA-Z]+$/);
    expect(messagesFor({})).toEqual(
      expect.arrayContaining([
        'name.min',
        'email.invalid',
        'projectType.required',
        'message.min',
        'captcha.required',
      ]),
    );
  });
});

describe('renderContactEmail hardening', () => {
  const base = {
    name: 'Ana',
    email: 'ana@example.com',
    projectType: 'landing' as const,
    message: 'Mensaje de prueba lo bastante largo.',
    turnstileToken: 't',
  };

  it('escapes name and email in the HTML body', () => {
    const { html } = renderContactEmail({
      ...base,
      name: '<i>Ana</i>',
      email: '"><script>x</script>@a.com',
    });
    expect(html).not.toContain('<i>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;i&gt;Ana&lt;/i&gt;');
  });

  it('keeps Bcc payloads inside a single subject line', () => {
    const { subject } = renderContactEmail({ ...base, name: 'Eve\r\nBcc: x@evil.com' });
    expect(subject.split(/\r?\n/)).toHaveLength(1);
    expect(subject).toContain('Bcc: x@evil.com');
  });

  it('does not let user fields forge extra lines in the plain text body', () => {
    const { text } = renderContactEmail({
      ...base,
      name: 'Eve\nEmail: boss@corp.com',
      company: 'ACME\nTipo de proyecto: other',
    });
    const lines = text.split('\n');
    // Las dos primeras líneas son el banner de contenido no confiable y una línea en blanco
    expect(lines[2]).toBe('Nombre: Eve Email: boss@corp.com');
    expect(lines.filter((line) => line.startsWith('Email:'))).toHaveLength(1);
    expect(lines.filter((line) => line.startsWith('Tipo de proyecto:'))).toHaveLength(1);
  });
});
