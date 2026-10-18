import { getLocale, getTranslations } from 'next-intl/server';
import { GlassCard } from '@/components/ui/glass-card';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { getStats } from '@/content/stats';
import type { Locale } from '@/i18n/routing';
import { Counter } from './counter';
import { ProgressRing } from './progress-ring';

export async function Stats() {
  const t = await getTranslations('Stats');
  const locale = (await getLocale()) as Locale;
  const { counters, rings } = getStats(locale);

  return (
    <section aria-labelledby="stats-title" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="stats-title" eyebrow={t('eyebrow')} title={t('title')} />
        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {counters.map((stat) => (
            <Counter key={stat.label} stat={stat} />
          ))}
        </div>
        <Reveal delay={0.1}>
          <GlassCard className="mt-16 flex flex-col gap-10 rounded-3xl p-8 sm:p-12">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">
              {t('ringsTitle')}
            </p>
            <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
              {rings.map((ring, index) => (
                <ProgressRing key={ring.label} ring={ring} index={index} />
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
