import type { MetadataRoute } from 'next';
import { getProjectPath, getProjects } from '@/content/projects';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const homes: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    changeFrequency: 'monthly',
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((option) => [option, `${SITE_URL}/${option}`]),
      ),
    },
  }));

  const cases: MetadataRoute.Sitemap = getProjects(routing.defaultLocale).flatMap((project) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${getProjectPath(locale, project.slug)}`,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((option) => [
            option,
            `${SITE_URL}${getProjectPath(option, project.slug)}`,
          ]),
        ),
      },
    })),
  );

  return [...homes, ...cases];
}
