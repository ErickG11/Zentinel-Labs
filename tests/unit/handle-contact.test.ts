import { describe, expect, it, vi } from 'vitest';
import { AppError } from '@/lib/app-error';
import { handleContactSubmission, type ContactDependencies } from '@/server/contact/handle-contact';
import { createLogger } from '@/server/logger';

const valid = {
  name: 'Ana Pérez',
  email: 'ana@empresa.com',
  projectType: 'landing',
  budget: 'undecided',
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

  it('pretends success for bots that fill the honeypot without sending anything', async () => {
    const deps = buildDeps();
    const outcome = await handleContactSubmission({ ...valid, website: 'spam' }, '1.1.1.1', deps);
    expect(outcome.ok).toBe(true);
    expect(deps.sendEmail).not.toHaveBeenCalled();
    expect(deps.rateLimiter.consume).not.toHaveBeenCalled();
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
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it('rejects invalid input before calling the captcha', async () => {
    const deps = buildDeps();
    await expect(
      handleContactSubmission({ ...valid, email: 'nope' }, '1.1.1.1', deps),
    ).resolves.toEqual({
      ok: false,
      code: 'VALIDATION_ERROR',
    });
    expect(deps.verifyCaptcha).not.toHaveBeenCalled();
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
});
