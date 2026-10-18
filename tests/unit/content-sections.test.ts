import { describe, expect, it } from 'vitest';
import { getProcessSteps } from '@/content/process';
import { getServices } from '@/content/services';
import { getStats } from '@/content/stats';

describe('getServices', () => {
  it('returns the three services numbered in order for each locale', () => {
    for (const locale of ['es', 'en'] as const) {
      const services = getServices(locale);
      expect(services.map((service) => service.id)).toEqual(['web', 'webapp', 'ecommerce']);
      expect(services.map((service) => service.number)).toEqual(['01', '02', '03']);
      expect(services.every((service) => service.deliverables.length >= 3)).toBe(true);
    }
  });

  it('localizes the copy', () => {
    expect(getServices('es')[1].title).not.toBe(getServices('en')[1].title);
  });
});

describe('getProcessSteps', () => {
  it('returns five numbered steps', () => {
    const steps = getProcessSteps('en');
    expect(steps).toHaveLength(5);
    expect(steps[0].number).toBe('01');
    expect(steps[4].number).toBe('05');
  });
});

describe('getStats', () => {
  it('keeps ring levels between 0 and 100', () => {
    const { rings, counters } = getStats('es');
    expect(counters.length).toBeGreaterThan(0);
    expect(rings.every((ring) => ring.level >= 0 && ring.level <= 100)).toBe(true);
  });
});
