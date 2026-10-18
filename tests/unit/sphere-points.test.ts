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

describe('createSpherePoints edge cases', () => {
  it('returns an empty array for count 0', () => {
    expect(createSpherePoints(0, 2)).toHaveLength(0);
  });

  it('returns the north pole for count 1', () => {
    expect(Array.from(createSpherePoints(1, 2))).toEqual([0, 2, 0]);
  });
});

describe('createDispersionSeeds', () => {
  it('keeps seeds between 0.2 and 1', () => {
    const seeds = createDispersionSeeds(4, () => 0);
    expect(Array.from(seeds)).toEqual([0.2, 0.2, 0.2, 0.2].map((v) => Math.fround(v)));
    const high = createDispersionSeeds(2, () => 0.999999);
    expect(high[0]).toBeLessThanOrEqual(1);
  });

  it('maps the random range to 0.2..1', () => {
    expect(createDispersionSeeds(1, () => 0)[0]).toBe(Math.fround(0.2));
    expect(createDispersionSeeds(1, () => 1)[0]).toBe(1);
    expect(createDispersionSeeds(1, () => 0.5)[0]).toBe(Math.fround(0.6));
  });
});
