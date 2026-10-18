import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('Home');

  return (
    <main>
      <h1>
        {t('title')} {t('titleHighlight')}
      </h1>
    </main>
  );
}
