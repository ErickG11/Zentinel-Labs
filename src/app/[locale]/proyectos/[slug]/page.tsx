import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { CaseGallery } from '@/components/case/case-gallery';
import { CaseHeroImage } from '@/components/case/case-hero';
import { NextProject } from '@/components/case/next-project';
import { SectionLink } from '@/components/layout/section-link';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Reveal } from '@/components/ui/reveal';
import { StatusBadge } from '@/components/ui/status-badge';
import { SplitReveal } from '@/components/ui/split-reveal';
import { getNextProject, getProjectBySlug, getProjectPath } from '@/content/projects';
import { routing, type Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo';

interface CasePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const project = getProjectBySlug(locale, slug);
  if (!project) return {};
  const t = await getTranslations({ locale, namespace: 'Case' });
  const title = t('metaTitle', { name: project.name });
  return {
    title,
    description: project.summary,
    alternates: buildAlternates(locale, (option: Locale) => getProjectPath(option, project.slug)),
    openGraph: { title, description: project.summary, images: [project.cover.src] },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const project = getProjectBySlug(locale, slug);
  if (!project) notFound();

  const t = await getTranslations({ locale, namespace: 'Case' });
  const next = getNextProject(locale, project.slug);

  const facts = [
    { label: t('client'), value: project.client },
    { label: t('year'), value: project.year },
    { label: t('role'), value: project.role },
    { label: t('stack'), value: project.stack.join(' · ') },
  ];

  const story = [
    { title: t('challenge'), text: project.challenge },
    { title: t('solution'), text: project.solution },
    { title: t('result'), text: project.result },
  ];

  return (
    <main id="main" className="px-6 pt-36 pb-28">
      <article className="mx-auto flex max-w-6xl flex-col gap-20">
        <header className="flex flex-col gap-8">
          <Reveal trigger="intro" y={12}>
            <SectionLink
              id="work"
              className="font-mono text-xs tracking-widest text-muted uppercase transition-colors hover:text-ink"
            >
              ← {t('back')}
            </SectionLink>
          </Reveal>
          <Reveal trigger="intro" y={12} delay={0.05}>
            <div className="flex flex-wrap items-center gap-4">
              <Eyebrow>{project.category}</Eyebrow>
              <StatusBadge
                status={project.status}
                label={project.status === 'live' ? t('status.live') : t('status.inDevelopment')}
              />
            </div>
          </Reveal>
          <SplitReveal
            as="h1"
            type="chars"
            trigger="intro"
            className="font-display text-6xl leading-none font-semibold tracking-tight sm:text-8xl lg:text-9xl"
          >
            {project.name}
          </SplitReveal>
          <Reveal trigger="intro" delay={0.3}>
            <p className="max-w-2xl text-xl text-pretty text-muted">{project.summary}</p>
          </Reveal>
        </header>

        <CaseHeroImage image={project.cover} />

        <Reveal>
          <dl className="grid gap-8 border-y border-border py-10 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-2">
                <dt className="font-mono text-xs tracking-widest text-muted uppercase">
                  {fact.label}
                </dt>
                <dd className="text-lg">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="grid gap-14 lg:grid-cols-3">
          {story.map((block, index) => {
            const isResult = index === story.length - 1;
            return (
              <Reveal key={block.title} delay={index * 0.1} className="flex flex-col gap-4">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  {block.title}
                </h2>
                <p
                  className={
                    isResult
                      ? 'font-display text-2xl leading-snug font-medium text-pretty text-ink'
                      : 'text-pretty text-muted'
                  }
                >
                  {block.text}
                </p>
              </Reveal>
            );
          })}
        </div>

        {project.status === 'live' && project.url ? (
          <Reveal>
            <Button href={project.url} size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>
              {t('visit')}
            </Button>
          </Reveal>
        ) : null}
        {project.status === 'in-development' ? (
          <Reveal>
            <p className="max-w-2xl text-lg text-pretty text-muted">{t('inDevelopmentNote')}</p>
          </Reveal>
        ) : null}

        <CaseGallery images={project.gallery} />

        <NextProject project={next} href={getProjectPath(locale, next.slug)} label={t('next')} />
      </article>
    </main>
  );
}
