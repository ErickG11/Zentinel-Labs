import type { Locale } from '@/i18n/routing';
import { pickLocale, type Localized } from './types';

interface StepCopy {
  title: string;
  description: string;
}

export interface ProcessStep extends StepCopy {
  number: string;
}

// TODO(Erick): revisar copy del proceso
const STEPS: Localized<StepCopy[]> = {
  es: [
    {
      title: 'Descubrimiento',
      description:
        'Entendemos tu negocio, tus usuarios y tus objetivos para definir el alcance exacto del proyecto.',
    },
    {
      title: 'Diseño',
      description:
        'Creamos la arquitectura de información y el diseño visual, y lo validamos contigo antes de escribir código.',
    },
    {
      title: 'Desarrollo',
      description:
        'Construimos con tecnología moderna, código limpio y pruebas automatizadas, con avances visibles cada semana.',
    },
    {
      title: 'Lanzamiento',
      description:
        'Publicamos con dominio, SEO, analítica y seguridad configurados, y verificamos el rendimiento en producción.',
    },
    {
      title: 'Soporte',
      description: 'Acompañamos el crecimiento con mantenimiento, mejoras y monitoreo continuo.',
    },
  ],
  en: [
    {
      title: 'Discovery',
      description:
        'We learn your business, users and goals to define the exact scope of the project.',
    },
    {
      title: 'Design',
      description:
        'We shape the information architecture and visual design, and validate it with you before writing code.',
    },
    {
      title: 'Development',
      description:
        'We build with modern technology, clean code and automated tests, with visible progress every week.',
    },
    {
      title: 'Launch',
      description:
        'We go live with domain, SEO, analytics and security configured, and verify performance in production.',
    },
    {
      title: 'Support',
      description:
        'We keep growing with you through maintenance, improvements and continuous monitoring.',
    },
  ],
};

export const getProcessSteps = (locale: Locale): ProcessStep[] =>
  pickLocale(STEPS, locale).map((step, index) => ({
    number: String(index + 1).padStart(2, '0'),
    ...step,
  }));
