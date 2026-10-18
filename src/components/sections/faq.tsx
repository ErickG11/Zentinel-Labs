import { getLocale, getTranslations } from 'next-intl/server';
import { SectionHeading } from '@/components/ui/section-heading';
import { getFaq } from '@/content/faq';
import { SECTION_IDS } from '@/content/navigation';
import type { Locale } from '@/i18n/routing';
import { FaqAccordion } from './faq-accordion';

export async function Faq() {
  const t = await getTranslations('Faq');
  const locale = (await getLocale()) as Locale;
  return (
    <section id={SECTION_IDS.faq} aria-labelledby="faq-title" className="section-anchor px-6 py-28">
      <div className="mx-auto max-w-4xl">
        <SectionHeading id="faq-title" eyebrow={t('eyebrow')} title={t('title')} />
        <FaqAccordion items={getFaq(locale)} />
      </div>
    </section>
  );
}
