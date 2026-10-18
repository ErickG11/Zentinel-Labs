import type { Locale } from '@/i18n/routing';
import { serializeJsonLd } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';

interface JsonLdProps {
  locale: Locale;
  description: string;
  nonce?: string;
}

export function JsonLd({ locale, description, nonce }: JsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        description,
        areaServed: 'Worldwide',
        knowsLanguage: ['es', 'en'],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Santo Domingo',
          addressCountry: 'EC',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: locale,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
