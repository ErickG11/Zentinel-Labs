'use server';

import { headers } from 'next/headers';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { fail, ok, type ApiResponse } from '@/lib/api-response';
import { getContactConfig, getServerEnv, type ServerEnv } from '@/server/env';
import { logger } from '@/server/logger';
import { getClientIp } from '@/server/security/client-ip';
import { createContactRateLimiter, type RateLimiter } from '@/server/security/rate-limiter';
import { verifyTurnstileToken } from '@/server/security/turnstile';
import { handleContactSubmission } from './handle-contact';
import { createResendSender } from './resend-sender';

let rateLimiter: RateLimiter | null = null;
const getRateLimiter = (): RateLimiter => {
  rateLimiter ??= createContactRateLimiter(getServerEnv());
  return rateLimiter;
};

// Fuera de producción las claves de prueba de Cloudflare devuelven un hostname ficticio
const expectedTurnstileHostname = (env: ServerEnv): string | undefined =>
  env.NODE_ENV === 'production' ? new URL(env.NEXT_PUBLIC_SITE_URL).hostname : undefined;

const FALLBACK_UNAVAILABLE = 'El formulario no está disponible en este momento.';

export async function submitContact(
  locale: string,
  input: unknown,
): Promise<ApiResponse<{ id: string }>> {
  try {
    const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
    const t = await getTranslations({ locale: safeLocale, namespace: 'Contact.responses' });

    const env = getServerEnv();
    const config = getContactConfig(env);
    if (!config) {
      logger.warn('contact.not_configured');
      return fail('SERVICE_UNAVAILABLE', t('SERVICE_UNAVAILABLE'));
    }

    const ip = getClientIp(await headers(), env.TRUSTED_PROXY);
    const outcome = await handleContactSubmission(input, ip, {
      rateLimiter: getRateLimiter(),
      verifyCaptcha: (token, remoteIp) =>
        verifyTurnstileToken({
          token,
          remoteIp,
          secret: config.turnstileSecret,
          expectedHostname: expectedTurnstileHostname(env),
        }),
      sendEmail: createResendSender(config),
      logger,
    });

    return outcome.ok ? ok({ id: outcome.id }, t('success')) : fail(outcome.code, t(outcome.code));
  } catch (error) {
    logger.error('contact.action_failed', {
      reason: error instanceof Error ? error.name : 'unknown',
    });
    return fail('SERVICE_UNAVAILABLE', await localizedUnavailable(locale));
  }
}

async function localizedUnavailable(locale: string): Promise<string> {
  try {
    const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
    const t = await getTranslations({ locale: safeLocale, namespace: 'Contact.responses' });
    return t('SERVICE_UNAVAILABLE');
  } catch {
    return FALLBACK_UNAVAILABLE;
  }
}
