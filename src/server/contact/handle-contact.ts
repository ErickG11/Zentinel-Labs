import 'server-only';
import type { AppErrorCode } from '@/lib/app-error';
import {
  contactSchema,
  isHoneypotFilled,
  type ContactInput,
} from '@/lib/validation/contact-schema';
import type { Logger } from '@/server/logger';
import type { RateLimiter } from '@/server/security/rate-limiter';

export interface ContactDependencies {
  rateLimiter: RateLimiter;
  verifyCaptcha: (token: string, ip: string) => Promise<boolean>;
  sendEmail: (input: ContactInput) => Promise<{ id: string }>;
  logger: Logger;
}

export type ContactOutcome = { ok: true; id: string } | { ok: false; code: AppErrorCode };

export const handleContactSubmission = async (
  input: unknown,
  ip: string,
  deps: ContactDependencies,
): Promise<ContactOutcome> => {
  // 1. Bots: respuesta de éxito falsa para no darles pistas
  if (isHoneypotFilled(input)) {
    deps.logger.warn('contact.honeypot_triggered');
    return { ok: true, id: 'ignored' };
  }

  // 2. Rate limit antes de cualquier trabajo costoso
  const limit = await deps.rateLimiter.consume(`contact:${ip}`);
  if (!limit.allowed) {
    deps.logger.warn('contact.rate_limited');
    return { ok: false, code: 'RATE_LIMITED' };
  }

  // 3. Validación (barata) antes de la llamada externa del captcha
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: 'VALIDATION_ERROR' };

  // 4. Captcha
  const human = await deps.verifyCaptcha(parsed.data.turnstileToken, ip);
  if (!human) {
    deps.logger.warn('contact.captcha_failed');
    return { ok: false, code: 'CAPTCHA_FAILED' };
  }

  // 5. Envío
  try {
    const { id } = await deps.sendEmail(parsed.data);
    deps.logger.info('contact.sent', { id });
    return { ok: true, id };
  } catch (error) {
    deps.logger.error('contact.email_failed', {
      reason: error instanceof Error ? error.message : 'unknown',
    });
    return { ok: false, code: 'EMAIL_FAILED' };
  }
};
