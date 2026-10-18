import { getLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';

export default async function NotFound() {
  const t = await getTranslations('NotFound');
  const locale = await getLocale();
  return (
    <main id="main" className="flex min-h-dvh items-center px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-7xl">
          {t('title')}
        </h1>
        <p className="text-lg text-muted">{t('text')}</p>
        <Button href={`/${locale}`} size="lg">
          {t('home')}
        </Button>
      </div>
    </main>
  );
}
