import { getLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { SECTION_IDS } from '@/content/navigation';
import { getProjectPath, getProjects } from '@/content/projects';
import type { Locale } from '@/i18n/routing';
import { ProjectList } from './project-list';

export async function Projects() {
  const t = await getTranslations('Projects');
  const locale = (await getLocale()) as Locale;
  const items = getProjects(locale).map((project) => ({
    project,
    href: getProjectPath(locale, project.slug),
  }));

  return (
    <section
      id={SECTION_IDS.work}
      aria-labelledby="work-title"
      className="section-anchor px-6 py-28"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="work-title"
          eyebrow={t('eyebrow')}
          title={t('title')}
          description={t('description')}
        />
        <ProjectList
          items={items}
          viewLabel={t('view')}
          statusLabels={{ live: t('status.live'), 'in-development': t('status.inDevelopment') }}
        />
        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-col items-start gap-6 rounded-3xl border border-dashed border-border p-8 transition-colors duration-500 hover:bg-ink/5 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {t('ctaTitle')}
              </h3>
              <p className="text-muted">{t('ctaText')}</p>
            </div>
            <Button href={`#${SECTION_IDS.contact}`}>{t('ctaButton')}</Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
