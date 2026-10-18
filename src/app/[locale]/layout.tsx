import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Background } from '@/components/layout/background';
import { Navbar } from '@/components/layout/navbar';
import { Preloader } from '@/components/layout/preloader';
import { SkipLink } from '@/components/layout/skip-link';
import { WhatsAppFab } from '@/components/layout/whatsapp-fab';
import { Providers } from '@/components/providers/providers';
import { Cursor } from '@/components/ui/cursor';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { introInitScript } from '@/lib/intro';
import { CSP_NONCE_HEADER } from '@/lib/security/csp';
import { themeInitScript } from '@/lib/theme';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
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

  const tWhatsApp = await getTranslations({ locale, namespace: 'WhatsApp' });
  const whatsappUrl = buildWhatsAppUrl(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    tWhatsApp('message'),
  );

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
          <Providers>
            <SkipLink />
            <Preloader />
            <Navbar />
            {children}
            <Cursor />
            {whatsappUrl ? <WhatsAppFab href={whatsappUrl} label={tWhatsApp('label')} /> : null}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
