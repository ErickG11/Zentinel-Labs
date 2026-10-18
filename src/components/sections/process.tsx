import { getLocale, getTranslations } from 'next-intl/server';
import { SectionHeading } from '@/components/ui/section-heading';
import { SECTION_IDS } from '@/content/navigation';
import { getProcessSteps } from '@/content/process';
import type { Locale } from '@/i18n/routing';
import { ProcessTrack } from './process-track';

export async function Process() {
  const t = await getTranslations('Process');
  const locale = (await getLocale()) as Locale;

  return (
    <section
      id={SECTION_IDS.process}
      aria-labelledby="process-title"
      className="section-anchor overflow-x-clip px-6 py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="process-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />
        <ProcessTrack steps={getProcessSteps(locale)} />
      </div>
    </section>
  );
}
