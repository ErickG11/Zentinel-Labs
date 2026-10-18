import { describe, expect, it } from 'vitest';
import { getFaq } from '@/content/faq';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

describe('getFaq', () => {
  it('returns the same number of questions in both locales', () => {
    expect(getFaq('es')).toHaveLength(getFaq('en').length);
    expect(getFaq('es').length).toBeGreaterThanOrEqual(5);
  });
});

describe('buildWhatsAppUrl', () => {
  it('keeps only digits and encodes the message', () => {
    expect(buildWhatsAppUrl('+593 99 123 4567', 'Hola, ¿qué tal?')).toBe(
      'https://wa.me/593991234567?text=Hola%2C%20%C2%BFqu%C3%A9%20tal%3F',
    );
  });

  it('returns null without a usable number', () => {
    expect(buildWhatsAppUrl(undefined, 'Hola')).toBeNull();
    expect(buildWhatsAppUrl('abc', 'Hola')).toBeNull();
  });
});
