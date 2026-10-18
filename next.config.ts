import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { securityHeaders } from './src/lib/security/headers';
import { getServerActionOrigins } from './src/lib/security/origins';

const allowedOrigins = getServerActionOrigins(process.env.NEXT_PUBLIC_SITE_URL);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Sin comodines; vac�o en local para usar la comprobaci�n de mismo origen por defecto
  ...(allowedOrigins.length > 0 && { experimental: { serverActions: { allowedOrigins } } }),
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async headers() {
    return [{ source: '/:path*', headers: [...securityHeaders] }];
  },
};

export default withNextIntl(nextConfig);
