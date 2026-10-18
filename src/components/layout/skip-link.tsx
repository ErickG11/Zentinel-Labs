import { getTranslations } from 'next-intl/server';

export async function SkipLink() {
  const t = await getTranslations('Nav');
  return (
    <a
      href="#main"
      data-skip-link=""
      className="sr-only z-[110] rounded-full bg-ink px-5 py-3 text-sm font-medium text-page focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
    >
      {t('skip')}
    </a>
  );
}
