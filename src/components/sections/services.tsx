import { getLocale, getTranslations } from 'next-intl/server';
import { SectionHeading } from '@/components/ui/section-heading';
import { SECTION_IDS } from '@/content/navigation';
import { getServices } from '@/content/services';
import type { Locale } from '@/i18n/routing';
import { ServicesStack } from './services-stack';

export async function Services() {
  const t = await getTranslations('Services');
  const locale = (await getLocale()) as Locale;

  return (
    <section
      id={SECTION_IDS.services}
      aria-labelledby="services-title"
      className="section-anchor px-6 py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="services-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />
        <ServicesStack services={getServices(locale)} />
      </div>
    </section>
  );
}
