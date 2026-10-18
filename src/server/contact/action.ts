'use server';

import { headers } from 'next/headers';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { fail, ok, type ApiResponse } from '@/lib/api-response';
import { getContactConfig, getServerEnv } from '@/server/env';
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

export async function submitContact(
  locale: string,
  input: unknown,
): Promise<ApiResponse<{ id: string }>> {
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: 'Contact.responses' });

  const config = getContactConfig(getServerEnv());
  if (!config) {
    logger.warn('contact.not_configured');
    return fail('SERVICE_UNAVAILABLE', t('SERVICE_UNAVAILABLE'));
  }

  const ip = getClientIp(await headers());
  const outcome = await handleContactSubmission(input, ip, {
    rateLimiter: getRateLimiter(),
    verifyCaptcha: (token, remoteIp) =>
      verifyTurnstileToken({ token, remoteIp, secret: config.turnstileSecret }),
    sendEmail: createResendSender(config),
    logger,
  });

  return outcome.ok ? ok({ id: outcome.id }, t('success')) : fail(outcome.code, t(outcome.code));
}
