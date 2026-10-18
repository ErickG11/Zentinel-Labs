import { routing, type Locale } from '@/i18n/routing';

interface Alternates {
  canonical: string;
  languages: Record<string, string>;
}

export const buildAlternates = (
  locale: Locale,
  pathFor: (locale: Locale) => string,
): Alternates => ({
  canonical: pathFor(locale),
  languages: {
    ...Object.fromEntries(routing.locales.map((option) => [option, pathFor(option)])),
    'x-default': pathFor(routing.defaultLocale),
  },
});

export const serializeJsonLd = (data: object): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');
