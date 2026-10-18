import { Globe as GlobeIcon, MapPin, Video } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Globe } from '@/components/remote/globe';
import { GlassCard } from '@/components/ui/glass-card';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';

export async function Remote() {
  const t = await getTranslations('Remote');
  const facts = [
    { icon: MapPin, text: t('location') },
    { icon: Video, text: t('meetings') },
    { icon: GlobeIcon, text: t('languages') },
  ];

  return (
    <section aria-labelledby="remote-title" className="px-6 py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div className="flex flex-col gap-10">
          <SectionHeading
            id="remote-title"
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />
          <ul className="flex flex-col gap-4">
            {facts.map(({ icon: Icon, text }, index) => (
              <Reveal
                as="li"
                key={text}
                delay={0.1 + index * 0.08}
                className="flex items-center gap-3 text-muted"
              >
                <Icon className="h-4 w-4 text-ink" aria-hidden />
                {text}
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal delay={0.1}>
          <GlassCard className="rounded-3xl p-4">
            <Globe hint={t('hint')} errorMessage={t('error')} />
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
