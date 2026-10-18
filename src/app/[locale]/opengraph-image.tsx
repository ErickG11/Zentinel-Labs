import { ImageResponse } from 'next/og';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Zentinel Labs';

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: 'Hero' });

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: '#0A0A0A',
        color: '#F5F5F5',
      }}
    >
      <div style={{ display: 'flex', fontSize: 34, fontWeight: 600 }}>
        zentinel_labs<span style={{ color: '#3D7BFF' }}>.</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.05,
        }}
      >
        <span>{t('title')}</span>
        <span style={{ color: '#8A8A8A' }}>{t('titleHighlight')}</span>
      </div>
    </div>,
    size,
  );
}
