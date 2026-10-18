import { getTranslations } from 'next-intl/server';
import { Eyebrow } from '@/components/ui/eyebrow';
import { ManifestoText } from './manifesto-text';

export async function Manifesto() {
  const t = await getTranslations('Manifesto');
  return (
    <section aria-label={t('eyebrow')} className="px-6 py-32 sm:py-44">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <ManifestoText>{t('text')}</ManifestoText>
      </div>
    </section>
  );
}
