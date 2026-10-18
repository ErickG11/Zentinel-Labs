import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Background } from '@/components/layout/background';
import { Providers } from '@/components/providers/providers';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { introInitScript } from '@/lib/intro';
import { CSP_NONCE_HEADER } from '@/lib/security/csp';
import { themeInitScript } from '@/lib/theme';
import '../globals.css';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: Omit<LocaleLayoutProps, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return { title: t('title'), description: t('description') };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const nonce = (await headers()).get(CSP_NONCE_HEADER) ?? undefined;

  return (
    // suppressHydrationWarning: el script de tema modifica la clase de <html> antes de hidratar
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: introInitScript }}
        />
      </head>
      <body className="relative min-h-dvh">
        <Background />
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
