import { describe, expect, it } from 'vitest';
import { fail, ok } from '@/lib/api-response';
import { AppError } from '@/lib/app-error';

describe('api responses', () => {
  it('builds the success shape', () => {
    expect(ok({ id: 'a1' }, 'Enviado')).toEqual({
      success: true,
      data: { id: 'a1' },
      message: 'Enviado',
    });
  });

  it('builds the error shape', () => {
    expect(fail('RATE_LIMITED', 'Espera')).toEqual({
      success: false,
      error: 'RATE_LIMITED',
      message: 'Espera',
    });
  });
});

describe('AppError', () => {
  it('carries a typed code', () => {
    const error = new AppError('EMAIL_FAILED', 'boom');
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('EMAIL_FAILED');
  });
});
