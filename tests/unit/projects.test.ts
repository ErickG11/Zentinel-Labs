import { describe, expect, it } from 'vitest';
import { getNextProject, getProjectBySlug, getProjectPath, getProjects } from '@/content/projects';

describe('projects content', () => {
  it('lists the authorized projects only', () => {
    expect(getProjects('es').map((project) => project.slug)).toEqual([
      'pan-de-vida',
      'gas-solutions',
    ]);
  });

  it('finds a project by slug and rejects unknown slugs', () => {
    expect(getProjectBySlug('en', 'gas-solutions')?.name).toBe('Gas Solutions');
    expect(getProjectBySlug('en', 'unknown-project')).toBeUndefined();
  });

  it('cycles to the next project', () => {
    expect(getNextProject('es', 'pan-de-vida').slug).toBe('gas-solutions');
    expect(getNextProject('es', 'gas-solutions').slug).toBe('pan-de-vida');
  });

  it('builds localized case paths', () => {
    expect(getProjectPath('es', 'pan-de-vida')).toBe('/es/proyectos/pan-de-vida');
    expect(getProjectPath('en', 'gas-solutions')).toBe('/en/work/gas-solutions');
  });

  it('gives every image alt text and a local source', () => {
    for (const project of getProjects('en')) {
      for (const image of [project.cover, ...project.gallery]) {
        expect(image.alt.length).toBeGreaterThan(10);
        expect(image.src.startsWith('/images/work/')).toBe(true);
      }
    }
  });
});
