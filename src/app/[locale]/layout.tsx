import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Background } from '@/components/layout/background';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { Preloader } from '@/components/layout/preloader';
import { SkipLink } from '@/components/layout/skip-link';
import { JsonLd } from '@/components/seo/json-ld';
import { Providers } from '@/components/providers/providers';
import { Cursor } from '@/components/ui/cursor';
import { routing, type Locale } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { introInitScript } from '@/lib/intro';
import { buildAlternates } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';
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
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const title = t('title');
  const description = t('description');

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: buildAlternates(locale, (option: Locale) => `/${option}`),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: locale === 'es' ? 'es_EC' : 'en_US',
      url: `/${locale}`,
      title,
      description,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const tMeta = await getTranslations({ locale, namespace: 'Metadata' });
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
        <JsonLd locale={locale} nonce={nonce} description={tMeta('description')} />
      </head>
      <body className="relative min-h-dvh">
        <Background />
        <NextIntlClientProvider>
          <Providers>
            <SkipLink />
            <Preloader />
            <Navbar />
            {children}
            <Footer />
            <Cursor />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
