import type { Locale } from '@/i18n/routing';

export type Localized<T> = Record<Locale, T>;

export const pickLocale = <T>(value: Localized<T>, locale: Locale): T => value[locale];
