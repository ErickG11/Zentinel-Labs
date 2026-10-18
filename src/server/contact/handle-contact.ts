import 'server-only';
import { AppError, type AppErrorCode } from '@/lib/app-error';
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
    return { ok: true, id: crypto.randomUUID() };
  }

  // 2. Validación local y barata: los errores de tipeo no consumen cuota
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: 'VALIDATION_ERROR' };

  // 3. Rate limit antes de las llamadas externas.
  // Decisión: fail-open si el limiter falla (Turnstile sigue protegiendo el envío).
  try {
    const limit = await deps.rateLimiter.consume(`contact:${ip}`);
    if (!limit.allowed) {
      deps.logger.warn('contact.rate_limited');
      return { ok: false, code: 'RATE_LIMITED' };
    }
  } catch {
    deps.logger.error('contact.rate_limiter_failed');
  }

  // 4. Captcha
  const human = await deps.verifyCaptcha(parsed.data.turnstileToken, ip);
  if (!human) {
    deps.logger.warn('contact.captcha_failed');
    return { ok: false, code: 'CAPTCHA_FAILED' };
  }

  // 5. Envío (nunca se registra el mensaje de error: puede contener datos del usuario)
  try {
    const { id } = await deps.sendEmail(parsed.data);
    deps.logger.info('contact.sent', { id });
    return { ok: true, id };
  } catch (error) {
    deps.logger.error('contact.email_failed', {
      reason: error instanceof AppError ? error.code : 'unknown',
    });
    return { ok: false, code: 'EMAIL_FAILED' };
  }
};
