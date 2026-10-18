import type { Locale } from '@/i18n/routing';
import { pickLocale, type Localized } from './types';

export interface FaqItem {
  question: string;
  answer: string;
}

// TODO(Erick): revisar y aprobar todas las respuestas (son compromisos comerciales)
const FAQ: Localized<FaqItem[]> = {
  es: [
    {
      question: '¿Cuánto tiempo toma desarrollar mi proyecto?',
      answer:
        'Depende del alcance. En la primera reunión definimos un cronograma claro con entregas semanales para que veas el avance desde el inicio.',
    },
    {
      question: '¿Cuánto cuesta?',
      answer:
        'Cada proyecto se cotiza a medida según su alcance. Después de conocer tu idea te enviamos una propuesta detallada, sin costos ocultos.',
    },
    {
      question: '¿El código y el diseño serán míos?',
      answer:
        'Sí. Al finalizar te entregamos el código fuente, los accesos y la documentación del proyecto.',
    },
    {
      question: '¿Ofrecen mantenimiento después del lanzamiento?',
      answer:
        'Sí. Ofrecemos soporte y mantenimiento para mantener tu sitio seguro, actualizado y en crecimiento.',
    },
    {
      question: '¿Se encargan del dominio y el hosting?',
      answer:
        'Te asesoramos para elegir dominio y hosting, y dejamos todo configurado: SSL, correo, analítica y despliegue.',
    },
    {
      question: '¿Cómo es el proceso de pago?',
      answer:
        'Trabajamos por hitos: un anticipo para iniciar y pagos contra entregas aprobadas por ti.',
    },
  ],
  en: [
    {
      question: 'How long does it take to build my project?',
      answer:
        'It depends on the scope. In our first meeting we set a clear timeline with weekly deliveries so you see progress from day one.',
    },
    {
      question: 'How much does it cost?',
      answer:
        'Every project is quoted individually based on its scope. Once we understand your idea we send you a detailed proposal with no hidden costs.',
    },
    {
      question: 'Will I own the code and the design?',
      answer:
        'Yes. At the end we hand over the source code, credentials and project documentation.',
    },
    {
      question: 'Do you offer maintenance after launch?',
      answer:
        'Yes. We offer support and maintenance to keep your site secure, up to date and growing.',
    },
    {
      question: 'Do you handle the domain and hosting?',
      answer:
        'We help you choose a domain and hosting and leave everything configured: SSL, email, analytics and deployment.',
    },
    {
      question: 'How does payment work?',
      answer:
        'We work by milestones: an upfront deposit to start and payments upon deliveries you approve.',
    },
  ],
};

export const getFaq = (locale: Locale): FaqItem[] => pickLocale(FAQ, locale);
