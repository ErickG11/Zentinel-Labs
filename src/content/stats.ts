import type { Locale } from '@/i18n/routing';
import { pickLocale, type Localized } from './types';

export interface CounterStat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface RingStat {
  level: number;
  label: string;
}

interface StatsContent {
  counters: CounterStat[];
  rings: RingStat[];
}

// TODO(Erick): confirmar cifras de los contadores
const STATS: Localized<StatsContent> = {
  es: {
    counters: [
      { value: 3, suffix: '+', label: 'Proyectos entregados' },
      { value: 100, suffix: '%', label: 'Código a medida, sin plantillas' },
      { value: 24, suffix: 'h', label: 'Tiempo máximo de respuesta' },
    ],
    rings: [
      { level: 90, label: 'Rendimiento' },
      { level: 95, label: 'Accesibilidad' },
      { level: 95, label: 'Buenas prácticas' },
      { level: 100, label: 'SEO' },
    ],
  },
  en: {
    counters: [
      { value: 3, suffix: '+', label: 'Projects delivered' },
      { value: 100, suffix: '%', label: 'Custom code, no templates' },
      { value: 24, suffix: 'h', label: 'Maximum response time' },
    ],
    rings: [
      { level: 90, label: 'Performance' },
      { level: 95, label: 'Accessibility' },
      { level: 95, label: 'Best practices' },
      { level: 100, label: 'SEO' },
    ],
  },
};

export const getStats = (locale: Locale): StatsContent => pickLocale(STATS, locale);
