import 'server-only';
import { Resend } from 'resend';
import { AppError } from '@/lib/app-error';
import type { ContactInput } from '@/lib/validation/contact-schema';
import type { ContactConfig } from '@/server/env';
import { renderContactEmail } from './email-template';

const SEND_TIMEOUT_MS = 10_000;

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new AppError('EMAIL_FAILED', 'Resend request timed out')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

export const createResendSender = (config: ContactConfig) => {
  const resend = new Resend(config.resendApiKey);

  return async (input: ContactInput): Promise<{ id: string }> => {
    const email = renderContactEmail(input);
    const { data, error } = await withTimeout(
      resend.emails.send({
        from: config.fromEmail,
        to: [config.toEmail],
        replyTo: input.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
      SEND_TIMEOUT_MS,
    );
    if (error || !data)
      throw new AppError('EMAIL_FAILED', error?.message ?? 'Resend returned no data');
    return { id: data.id };
  };
};
