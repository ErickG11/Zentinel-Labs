import type { Locale } from '@/i18n/routing';
import { pickLocale, type Localized } from './types';

export type ServiceId = 'web' | 'webapp' | 'ecommerce';

interface ServiceCopy {
  title: string;
  description: string;
  deliverables: string[];
}

export interface Service extends ServiceCopy {
  id: ServiceId;
  number: string;
}

const SERVICE_ORDER: readonly ServiceId[] = ['web', 'webapp', 'ecommerce'];

// TODO(Erick): revisar copy de servicios
const COPY: Localized<Record<ServiceId, ServiceCopy>> = {
  es: {
    web: {
      title: 'Webs corporativas y landing pages',
      description:
        'Sitios rápidos, optimizados para SEO y diseñados a la medida de tu marca para convertir visitas en clientes.',
      deliverables: [
        'Diseño UI/UX a medida',
        'SEO técnico',
        'Animaciones e interacciones',
        'Alto rendimiento',
      ],
    },
    webapp: {
      title: 'Aplicaciones web a medida',
      description:
        'Sistemas, paneles y plataformas que automatizan los procesos de tu negocio, con autenticación, roles y datos seguros.',
      deliverables: [
        'Arquitectura escalable',
        'Autenticación y roles',
        'Bases de datos',
        'APIs e integraciones',
      ],
    },
    ecommerce: {
      title: 'E-commerce',
      description:
        'Tiendas online con catálogo, carrito y pagos en línea, pensadas para vender desde el primer día.',
      deliverables: [
        'Catálogo y carrito',
        'Pagos en línea',
        'Gestión de pedidos',
        'Analítica de ventas',
      ],
    },
  },
  en: {
    web: {
      title: 'Corporate websites & landing pages',
      description:
        'Fast, SEO-ready sites designed around your brand to turn visitors into customers.',
      deliverables: [
        'Custom UI/UX design',
        'Technical SEO',
        'Animations & interactions',
        'High performance',
      ],
    },
    webapp: {
      title: 'Custom web applications',
      description:
        'Systems, dashboards and platforms that automate your business processes, with authentication, roles and secure data.',
      deliverables: ['Scalable architecture', 'Auth & roles', 'Databases', 'APIs & integrations'],
    },
    ecommerce: {
      title: 'E-commerce',
      description:
        'Online stores with catalog, cart and online payments, built to sell from day one.',
      deliverables: ['Catalog & cart', 'Online payments', 'Order management', 'Sales analytics'],
    },
  },
};

export const getServices = (locale: Locale): Service[] => {
  const copy = pickLocale(COPY, locale);
  return SERVICE_ORDER.map((id, index) => ({
    id,
    number: String(index + 1).padStart(2, '0'),
    ...copy[id],
  }));
};
