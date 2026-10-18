import type { AppErrorCode } from './app-error';

export type ApiResponse<T> =
  | { success: true; data: T; message: string }
  | { success: false; error: AppErrorCode; message: string };

export const ok = <T>(data: T, message: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const fail = (error: AppErrorCode, message: string): ApiResponse<never> => ({
  success: false,
  error,
  message,
});
