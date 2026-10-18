import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/proyectos/[slug]': {
      es: '/proyectos/[slug]',
      en: '/work/[slug]',
    },
  },
});

export type Locale = (typeof routing.locales)[number];
