export const SECTION_IDS = {
  services: 'services',
  process: 'process',
  work: 'work',
  faq: 'faq',
  contact: 'contact',
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const NAV_SECTIONS: readonly SectionId[] = ['services', 'process', 'work', 'faq'];
