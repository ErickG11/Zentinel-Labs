export type AppErrorCode =
  'VALIDATION_ERROR' | 'RATE_LIMITED' | 'CAPTCHA_FAILED' | 'EMAIL_FAILED' | 'SERVICE_UNAVAILABLE';

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AppError';
    this.code = code;
  }
}
