import type { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { buildCsp, CSP_NONCE_HEADER } from './lib/security/csp';

const handleI18nRouting = createMiddleware(routing);

const createNonce = (): string => Buffer.from(crypto.randomUUID()).toString('base64');

export function proxy(request: NextRequest): NextResponse {
  const nonce = createNonce();
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV === 'development',
    upgradeInsecureRequests: request.nextUrl.protocol === 'https:',
  });

  // next-intl reenvía una copia de request.headers, así que el nonce llega al render
  request.headers.set(CSP_NONCE_HEADER, nonce);
  request.headers.set('Content-Security-Policy', csp);

  const response = handleI18nRouting(request);
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next|_vercel|.*\\..*).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
