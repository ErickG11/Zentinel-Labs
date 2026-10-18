import { routing, type Locale } from '@/i18n/routing';
import { pickLocale, type Localized } from './types';

export type ProjectSlug = 'pan-de-vida' | 'gas-solutions';

export type ProjectStatus = 'live' | 'in-development';

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

interface ProjectBase {
  slug: ProjectSlug;
  status: ProjectStatus;
  name: string;
  year: string;
  stack: string[];
  url?: string;
}

interface ProjectCopy {
  client: string;
  category: string;
  role: string;
  summary: string;
  challenge: string;
  solution: string;
  result: string;
  coverAlt: string;
  galleryAlts: [string, string, string];
}

export interface Project extends ProjectBase {
  client: string;
  category: string;
  role: string;
  summary: string;
  challenge: string;
  solution: string;
  result: string;
  cover: ProjectImage;
  gallery: ProjectImage[];
}

const SHOT_SIZE = { width: 1600, height: 1000 } as const;

const BASES: readonly ProjectBase[] = [
  {
    slug: 'pan-de-vida',
    status: 'in-development',
    name: 'Pan de Vida',
    // TODO(Erick): confirmar año
    year: '2026',
    stack: ['React 19', 'Vite', 'GSAP', 'CSS'],
  },
  {
    slug: 'gas-solutions',
    status: 'live',
    name: 'Gas Solutions',
    // TODO(Erick): confirmar año
    year: '2026',
    stack: ['HTML5', 'CSS3', 'JavaScript'],
    url: 'https://gassolpro.com',
  },
];

// TODO(Erick): revisar todos los textos de los casos (cliente, rol y resultado)
const COPY: Localized<Record<ProjectSlug, ProjectCopy>> = {
  es: {
    'pan-de-vida': {
      // TODO(Erick): confirmar descripción del cliente
      client: 'Panadería de tradición lojana',
      category: 'Web corporativa',
      role: 'Diseño y desarrollo',
      summary:
        'Sitio web para una panadería de tradición lojana, con catálogo de productos, reseñas, ubicación y una animación de scroll protagonizada por su pan.',
      challenge:
        'Trasladar la calidez de una panadería artesanal a una web moderna que muestre su catálogo y lleve clientes al local.',
      solution:
        'Diseño oscuro y cálido con una animación de scroll construida con GSAP, catálogo de productos, sección de reseñas, mapa de ubicación y contacto directo.',
      result:
        'Una web rápida y adaptable que presenta la marca y su catálogo en cualquier dispositivo.',
      coverAlt: 'Catálogo de productos del sitio de Pan de Vida con sus panes artesanales',
      galleryAlts: [
        'Sección de historia y cifras de la panadería',
        'Catálogo de productos de Pan de Vida',
        'Sección de reseñas y ubicación del local',
      ],
    },
    'gas-solutions': {
      // TODO(Erick): confirmar descripción del cliente
      client: 'Distribuidor de equipos para estaciones de servicio',
      category: 'Web corporativa y catálogo',
      role: 'Diseño y desarrollo',
      summary:
        'Sitio corporativo para un distribuidor autorizado de equipos para estaciones de servicio en Santo Domingo, Ecuador.',
      challenge:
        'Presentar de forma clara y confiable un catálogo técnico amplio —dispensadores, bombas, monitoreo y accesorios— y las marcas que distribuye.',
      solution:
        'Web multipágina adaptable con productos por marca, servicios, carrusel de certificaciones y contacto con mapa.',
      result:
        'Una presencia digital profesional que respalda la relación con estaciones de servicio y proveedores.',
      coverAlt: 'Portada del sitio de Gas Solutions con su propuesta para estaciones de servicio',
      galleryAlts: [
        'Sección institucional y marcas que distribuye Gas Solutions',
        'Línea de productos de Gas Solutions',
        'Sección de servicios técnicos de Gas Solutions',
      ],
    },
  },
  en: {
    'pan-de-vida': {
      // TODO(Erick): confirmar descripción del cliente
      client: 'Traditional bakery from Loja, Ecuador',
      category: 'Corporate website',
      role: 'Design & development',
      summary:
        'Website for a traditional Loja bakery, featuring a product catalog, reviews, location and a scroll animation starring its bread.',
      challenge:
        'Bring the warmth of an artisan bakery to a modern website that showcases its catalog and drives customers to the store.',
      solution:
        'A dark, warm design with a GSAP-powered scroll animation, product catalog, reviews section, location map and direct contact.',
      result: 'A fast, responsive website that presents the brand and its catalog on any device.',
      coverAlt: 'Pan de Vida website product catalog showing its artisan breads',
      galleryAlts: [
        'Bakery story and figures section',
        'Pan de Vida product catalog',
        'Reviews and store location section',
      ],
    },
    'gas-solutions': {
      // TODO(Erick): confirmar descripción del cliente
      client: 'Fuel station equipment distributor',
      category: 'Corporate website & catalog',
      role: 'Design & development',
      summary:
        'Corporate website for an authorized fuel station equipment distributor in Santo Domingo, Ecuador.',
      challenge:
        'Present a broad technical catalog —dispensers, pumps, monitoring and accessories— and the brands it distributes in a clear, trustworthy way.',
      solution:
        'A responsive multi-page site with products by brand, services, a certifications carousel and contact with map.',
      result:
        'A professional online presence that supports relationships with fuel stations and suppliers.',
      coverAlt: 'Gas Solutions website hero presenting its fuel station offering',
      galleryAlts: [
        'Gas Solutions company and brands section',
        'Gas Solutions product line',
        'Gas Solutions technical services section',
      ],
    },
  },
};

const image = (slug: ProjectSlug, name: string, alt: string): ProjectImage => ({
  src: `/images/work/${slug}/${name}.jpg`,
  ...SHOT_SIZE,
  alt,
});

export const getProjects = (locale: Locale): Project[] => {
  const copy = pickLocale(COPY, locale);
  return BASES.map((base) => {
    const { coverAlt, galleryAlts, ...text } = copy[base.slug];
    return {
      ...base,
      stack: [...base.stack],
      ...text,
      cover: image(base.slug, 'cover', coverAlt),
      gallery: galleryAlts.map((alt, index) => image(base.slug, `shot-${index + 1}`, alt)),
    };
  });
};

export const getProjectBySlug = (locale: Locale, slug: string): Project | undefined =>
  getProjects(locale).find((project) => project.slug === slug);

export const getNextProject = (locale: Locale, slug: ProjectSlug): Project => {
  const projects = getProjects(locale);
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length];
};

export const getProjectPath = (locale: Locale, slug: ProjectSlug): string =>
  `/${locale}${routing.pathnames['/proyectos/[slug]'][locale].replace('[slug]', slug)}`;
