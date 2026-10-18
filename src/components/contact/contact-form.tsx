'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useInView } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTheme } from '@/hooks/use-theme';
import type { ApiResponse } from '@/lib/api-response';
import { contactSchema, PROJECT_TYPES, type ContactInput } from '@/lib/validation/contact-schema';
import { submitContact } from '@/server/contact/action';
import { ChoiceGroup } from './choice-group';
import { ContactSuccess } from './contact-success';
import { FieldError } from './field-error';
import { FloatingInput, FloatingTextarea } from './floating-field';
import {
  getCounterState,
  MESSAGE_MAX,
  MESSAGE_MIN,
  MessageCounter,
  type CounterState,
} from './message-counter';
import { SubmitButton, type SubmitStatus } from './submit-button';

interface ContactFormProps {
  turnstileSiteKey: string | undefined;
  whatsappUrl: string | null;
}

export function ContactForm({ turnstileSiteKey, whatsappUrl }: ContactFormProps) {
  const t = useTranslations('Contact');
  const locale = useLocale();
  const { theme } = useTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const inView = useInView(formRef, { once: true, margin: '300px' });
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [result, setResult] = useState<ApiResponse<{ id: string }> | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      message: '',
      turnstileToken: '',
      website: '',
    },
  });

  const messageLength = (useWatch({ control, name: 'message' }) ?? '').length;
  const counterState = getCounterState(messageLength);
  const counterAnnouncements: Record<CounterState, string> = {
    empty: '',
    'below-min': '',
    ok: t('counterOk'),
    'near-max': t('counterNear', { remaining: MESSAGE_MAX - messageLength }),
    'at-max': t('counterMax', { max: MESSAGE_MAX }),
  };

  // Al aparecer el panel de exito el foco se mueve a el
  useEffect(() => {
    if (status === 'success') document.getElementById('contact-success')?.focus();
  }, [status]);

  const resetForm = (): void => {
    setStatus('idle');
    setResult(null);
  };

  // Los mensajes del esquema son claves de traducción (p. ej. "name.min")
  const errorText = (message: string | undefined): string | undefined =>
    message ? t(`errors.${message}` as Parameters<typeof t>[0]) : undefined;

  const onSubmit = async (values: ContactInput): Promise<void> => {
    setStatus('loading');
    const response = await submitContact(locale, values);
    setResult(response);
    setStatus(response.success ? 'success' : 'error');
    if (response.success) reset();
    turnstileRef.current?.reset();
    setValue('turnstileToken', '');
  };

  const projectOptions = PROJECT_TYPES.map((value) => ({
    value,
    label: t(`projectTypes.${value}`),
  }));

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="flex flex-col gap-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FloatingInput
          id="contact-name"
          label={t('fields.name')}
          autoComplete="name"
          error={errorText(errors.name?.message)}
          {...register('name')}
        />
        <FloatingInput
          id="contact-email"
          type="email"
          label={t('fields.email')}
          autoComplete="email"
          error={errorText(errors.email?.message)}
          {...register('email')}
        />
      </div>
      <FloatingInput
        id="contact-company"
        label={t('fields.company')}
        autoComplete="organization"
        error={errorText(errors.company?.message)}
        {...register('company')}
      />
      <ChoiceGroup
        name="projectType"
        legend={t('fields.projectType')}
        options={projectOptions}
        registration={register('projectType')}
        error={errorText(errors.projectType?.message)}
      />
      <FloatingTextarea
        id="contact-message"
        label={t('fields.message')}
        error={errorText(errors.message?.message)}
        describedBy="contact-message-counter"
        footer={
          <MessageCounter
            id="contact-message-counter"
            count={messageLength}
            labels={{
              counter: t('counter', { count: messageLength, max: MESSAGE_MAX }),
              minHint: t('minHint', { min: MESSAGE_MIN }),
              announcement: counterAnnouncements[counterState],
            }}
          />
        }
        {...register('message')}
      />

      {/* Honeypot: invisible para personas, tentador para bots */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">{t('honeypot')}</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <input type="hidden" {...register('turnstileToken')} />
      {turnstileSiteKey && inView ? (
        <div
          role="group"
          aria-label={t('captchaLabel')}
          aria-describedby={errors.turnstileToken?.message ? 'turnstile-error' : undefined}
        >
          <Turnstile
            key={theme}
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            options={{ theme, language: locale, size: 'flexible' }}
            onSuccess={(token) => setValue('turnstileToken', token, { shouldValidate: true })}
            onExpire={() => setValue('turnstileToken', '')}
          />
          <FieldError id="turnstile-error">{errorText(errors.turnstileToken?.message)}</FieldError>
        </div>
      ) : null}

      {status === 'success' ? (
        <ContactSuccess
          title={t('sentTitle')}
          next={t('sentNext')}
          reply={t('sentReply')}
          resetLabel={t('sendAnother')}
          onReset={resetForm}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-5">
          <SubmitButton
            status={status}
            labels={{
              idle: t('submit'),
              loading: t('sending'),
              success: t('sent'),
              error: t('retry'),
            }}
          />
          <p role="status" aria-live="polite" className="text-sm text-muted">
            {result?.message}
            {result && !result.success && whatsappUrl ? (
              <>
                {' '}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4"
                >
                  {t('whatsappAlt')}
                </a>
              </>
            ) : null}
          </p>
        </div>
      )}
    </form>
  );
}
