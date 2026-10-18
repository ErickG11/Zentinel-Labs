import { describe, expect, it, vi } from 'vitest';
import { AppError } from '@/lib/app-error';
import { handleContactSubmission, type ContactDependencies } from '@/server/contact/handle-contact';
import { createLogger, type LogEntry } from '@/server/logger';

const valid = {
  name: 'Ana Pérez',
  email: 'ana@empresa.com',
  projectType: 'landing',
  message: 'Queremos una landing para nuestro nuevo producto.',
  turnstileToken: 'token',
  website: '',
};

const buildDeps = (overrides: Partial<ContactDependencies> = {}): ContactDependencies => ({
  rateLimiter: { consume: vi.fn().mockResolvedValue({ allowed: true, remaining: 4, resetAt: 0 }) },
  verifyCaptcha: vi.fn().mockResolvedValue(true),
  sendEmail: vi.fn().mockResolvedValue({ id: 'email-1' }),
  logger: createLogger({ minLevel: 'error', write: vi.fn() }),
  ...overrides,
});

describe('handleContactSubmission', () => {
  it('sends the email for a valid, human, non-limited submission', async () => {
    const deps = buildDeps();
    await expect(handleContactSubmission(valid, '1.1.1.1', deps)).resolves.toEqual({
      ok: true,
      id: 'email-1',
    });
    expect(deps.verifyCaptcha).toHaveBeenCalledWith('token', '1.1.1.1');
  });

  it('pretends success for bots (also with whitespace) without sending or consuming quota', async () => {
    const deps = buildDeps();
    const outcome = await handleContactSubmission(
      { ...valid, website: '  spam ' },
      '1.1.1.1',
      deps,
    );
    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(outcome.id).not.toBe('ignored');
    expect(deps.sendEmail).not.toHaveBeenCalled();
    expect(deps.rateLimiter.consume).not.toHaveBeenCalled();
  });

  it('treats null, arrays and non-string honeypots as validation errors, never as success', async () => {
    for (const input of [null, [], { ...valid, website: ['x'] }, { ...valid, website: null }]) {
      const deps = buildDeps();
      await expect(handleContactSubmission(input, '1.1.1.1', deps)).resolves.toEqual({
        ok: false,
        code: 'VALIDATION_ERROR',
      });
      expect(deps.sendEmail).not.toHaveBeenCalled();
    }
  });

  it('blocks when the rate limit is exceeded', async () => {
    const deps = buildDeps({
      rateLimiter: {
        consume: vi.fn().mockResolvedValue({ allowed: false, remaining: 0, resetAt: 0 }),
      },
    });
    await expect(handleContactSubmission(valid, '1.1.1.1', deps)).resolves.toEqual({
      ok: false,
      code: 'RATE_LIMITED',
    });
    expect(deps.verifyCaptcha).not.toHaveBeenCalled();
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it('rejects invalid input without consuming rate limit or calling the captcha', async () => {
    const deps = buildDeps();
    await expect(
      handleContactSubmission({ ...valid, email: 'nope' }, '1.1.1.1', deps),
    ).resolves.toEqual({ ok: false, code: 'VALIDATION_ERROR' });
    expect(deps.rateLimiter.consume).not.toHaveBeenCalled();
    expect(deps.verifyCaptcha).not.toHaveBeenCalled();
  });

  it('keeps going (fail-open) when the rate limiter throws, and logs the failure', async () => {
    const entries: LogEntry[] = [];
    const deps = buildDeps({
      rateLimiter: { consume: vi.fn().mockRejectedValue(new Error('redis down')) },
      logger: createLogger({ minLevel: 'debug', write: (entry) => entries.push(entry) }),
    });
    await expect(handleContactSubmission(valid, '1.1.1.1', deps)).resolves.toEqual({
      ok: true,
      id: 'email-1',
    });
    expect(entries.map((entry) => entry.message)).toContain('contact.rate_limiter_failed');
  });

  it('rejects failed captchas', async () => {
    const deps = buildDeps({ verifyCaptcha: vi.fn().mockResolvedValue(false) });
    await expect(handleContactSubmission(valid, '1.1.1.1', deps)).resolves.toEqual({
      ok: false,
      code: 'CAPTCHA_FAILED',
    });
  });

  it('reports email failures without leaking details', async () => {
    const deps = buildDeps({
      sendEmail: vi.fn().mockRejectedValue(new AppError('EMAIL_FAILED', 'quota')),
    });
    await expect(handleContactSubmission(valid, '1.1.1.1', deps)).resolves.toEqual({
      ok: false,
      code: 'EMAIL_FAILED',
    });
  });

  it('never writes PII (email, name, message, ip) to the logs', async () => {
    const entries: LogEntry[] = [];
    const logger = createLogger({ minLevel: 'debug', write: (entry) => entries.push(entry) });
    const ip = '203.0.113.77';
    const secretMessage = 'Queremos una landing para nuestro nuevo producto.';
    const runs: Array<Partial<ContactDependencies>> = [
      {},
      { verifyCaptcha: vi.fn().mockResolvedValue(false) },
      {
        rateLimiter: {
          consume: vi.fn().mockResolvedValue({ allowed: false, remaining: 0, resetAt: 0 }),
        },
      },
      {
        rateLimiter: {
          consume: vi.fn().mockRejectedValue(new Error(`boom ${ip} ana@empresa.com`)),
        },
      },
      {
        sendEmail: vi
          .fn()
          .mockRejectedValue(
            new AppError('EMAIL_FAILED', `bad ${valid.email} ${ip} ${valid.name}`),
          ),
      },
      { sendEmail: vi.fn().mockRejectedValue(new Error(`raw ${secretMessage}`)) },
    ];
    for (const overrides of runs) {
      await handleContactSubmission(valid, ip, buildDeps({ ...overrides, logger }));
    }
    await handleContactSubmission({ ...valid, website: 'spam' }, ip, buildDeps({ logger }));
    await handleContactSubmission({ ...valid, email: 'x' }, ip, buildDeps({ logger }));

    expect(entries.length).toBeGreaterThan(0);
    const dump = JSON.stringify(entries);
    for (const pii of [valid.email, valid.name, secretMessage, ip, 'Pérez']) {
      expect(dump).not.toContain(pii);
    }
  });
});
