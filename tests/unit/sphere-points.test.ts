import { describe, expect, it } from 'vitest';
import { createDispersionSeeds, createSpherePoints } from '@/components/three/sphere-points';

describe('createSpherePoints', () => {
  it('returns xyz triplets for every point', () => {
    expect(createSpherePoints(500, 1.5)).toHaveLength(1500);
  });

  it('places every point on the sphere surface', () => {
    const points = createSpherePoints(300, 2);
    for (let i = 0; i < points.length; i += 3) {
      const distance = Math.hypot(points[i], points[i + 1], points[i + 2]);
      expect(distance).toBeCloseTo(2, 5);
    }
  });
});

describe('createDispersionSeeds', () => {
  it('keeps seeds between 0.2 and 1', () => {
    const seeds = createDispersionSeeds(4, () => 0);
    expect(Array.from(seeds)).toEqual([0.2, 0.2, 0.2, 0.2].map((v) => Math.fround(v)));
    const high = createDispersionSeeds(2, () => 0.999999);
    expect(high[0]).toBeLessThanOrEqual(1);
  });
});
