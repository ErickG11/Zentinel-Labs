import { getTranslations } from 'next-intl/server';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Eyebrow } from '@/components/ui/eyebrow';
import { GlassCard } from '@/components/ui/glass-card';

export default async function HomePage() {
  const t = await getTranslations('Home');

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center gap-8 px-6 py-28">
      <div className="flex items-center justify-between">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <ThemeToggle />
      </div>
      <h1 className="font-display text-5xl leading-[1.05] font-semibold tracking-tight sm:text-7xl">
        {t('title')} <span className="text-gradient">{t('titleHighlight')}</span>
      </h1>
      <p className="max-w-2xl text-lg text-muted">{t('subtitle')}</p>
      <GlassCard className="flex w-fit items-center gap-3 px-5 py-3 font-mono text-sm">
        <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
        {t('status')}
      </GlassCard>
    </main>
  );
}
