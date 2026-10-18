import { ArrowDownRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { HeroVisual } from '@/components/hero/hero-visual';
import { Terminal } from '@/components/hero/terminal';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { SplitReveal } from '@/components/ui/split-reveal';
import { SECTION_IDS } from '@/content/navigation';

export async function Hero() {
  const t = await getTranslations('Hero');

  return (
    <section className="relative isolate flex min-h-dvh items-center overflow-hidden px-6 pt-36 pb-24">
      <HeroVisual className="absolute top-1/2 right-[-55%] -z-10 aspect-square w-[min(120vw,920px)] -translate-y-1/2 opacity-35 sm:right-[-20%] sm:opacity-100 lg:right-[-10%]" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-8">
          <Reveal trigger="intro" y={12}>
            <span className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 font-mono text-xs tracking-widest text-muted uppercase glass">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {t('status')}
            </span>
          </Reveal>

          <SplitReveal
            as="h1"
            type="chars"
            trigger="intro"
            delay={0.1}
            className="font-display text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-7xl lg:text-[5.5rem]"
          >
            {t('title')} <span className="text-muted">{t('titleHighlight')}</span>
          </SplitReveal>

          <Reveal trigger="intro" delay={0.45}>
            <p className="max-w-xl text-lg text-pretty text-muted">{t('subtitle')}</p>
          </Reveal>

          <Reveal trigger="intro" delay={0.6}>
            <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
              <Button
                href={`#${SECTION_IDS.contact}`}
                size="lg"
                className="w-full sm:w-auto"
                icon={<ArrowDownRight className="h-4 w-4" />}
              >
                {t('primaryCta')}
              </Button>
              <Button
                href={`#${SECTION_IDS.work}`}
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {t('secondaryCta')}
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal trigger="intro" delay={0.4} className="hidden justify-self-end lg:block">
          <Terminal />
        </Reveal>
      </div>

      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-muted uppercase">
          {t('scroll')}
        </span>
        <span className="block h-12 w-px animate-scroll-line bg-ink/50" />
      </div>
    </section>
  );
}
