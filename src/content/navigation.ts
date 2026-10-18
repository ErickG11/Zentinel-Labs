export const SECTION_IDS = {
  services: 'services',
  process: 'process',
  work: 'work',
  faq: 'faq',
  contact: 'contact',
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const NAV_SECTIONS: readonly SectionId[] = ['services', 'process', 'work', 'faq'];

interface SectionHrefOptions {
  isHome: boolean;
  locale: string;
}

// En la home basta el ancla; desde otra página hay que volver a la home con el hash
export const sectionHref = (id: SectionId, { isHome, locale }: SectionHrefOptions): string =>
  isHome ? `#${id}` : `/${locale}#${id}`;
