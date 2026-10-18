import 'server-only';
import { Resend } from 'resend';
import { AppError } from '@/lib/app-error';
import type { ContactInput } from '@/lib/validation/contact-schema';
import type { ContactConfig } from '@/server/env';
import { renderContactEmail } from './email-template';

export const createResendSender = (config: ContactConfig) => {
  const resend = new Resend(config.resendApiKey);

  return async (input: ContactInput): Promise<{ id: string }> => {
    const email = renderContactEmail(input);
    const { data, error } = await resend.emails.send({
      from: config.fromEmail,
      to: [config.toEmail],
      replyTo: input.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (error || !data)
      throw new AppError('EMAIL_FAILED', error?.message ?? 'Resend returned no data');
    return { id: data.id };
  };
};
