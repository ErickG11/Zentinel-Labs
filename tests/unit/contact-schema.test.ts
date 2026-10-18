import { describe, expect, it } from 'vitest';
import { contactSchema, isHoneypotFilled } from '@/lib/validation/contact-schema';

const valid = {
  name: '  Ana Pérez ',
  email: 'ana@empresa.com',
  company: '',
  projectType: 'webapp',
  budget: '1000-3000',
  message: 'Necesitamos un sistema de reservas para nuestra clínica.',
  turnstileToken: 'token-123',
  website: '',
};

const messagesFor = (input: unknown): string[] => {
  const result = contactSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('contactSchema', () => {
  it('accepts a valid submission and trims text', () => {
    const result = contactSchema.parse(valid);
    expect(result.name).toBe('Ana Pérez');
  });

  it('returns translation keys for invalid fields', () => {
    const messages = messagesFor({
      ...valid,
      name: 'A',
      email: 'x',
      message: 'corto',
      projectType: 'nope',
    });
    expect(messages).toEqual(
      expect.arrayContaining(['name.min', 'email.invalid', 'message.min', 'projectType.required']),
    );
  });

  it('requires the captcha token', () => {
    expect(messagesFor({ ...valid, turnstileToken: '' })).toContain('captcha.required');
  });

  it('caps the message length', () => {
    expect(messagesFor({ ...valid, message: 'a'.repeat(2001) })).toContain('message.max');
  });
});

describe('isHoneypotFilled', () => {
  it('detects bots filling the hidden field', () => {
    expect(isHoneypotFilled({ website: 'http://spam.example' })).toBe(true);
    expect(isHoneypotFilled({ website: '' })).toBe(false);
    expect(isHoneypotFilled(null)).toBe(false);
  });
});
