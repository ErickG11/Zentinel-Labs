import type { Feature, MultiPolygon, Polygon } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  generateDotsInFeature,
  pointInFeature,
  pointInRing,
} from '@/components/remote/globe-geometry';

const square = (min: number, max: number) => [
  [min, min],
  [max, min],
  [max, max],
  [min, max],
  [min, min],
];

const donut: Feature<Polygon> = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'Polygon', coordinates: [square(0, 10), square(4, 6)] },
};

const islands: Feature<MultiPolygon> = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'MultiPolygon', coordinates: [[square(0, 2)], [square(10, 12)]] },
};

describe('pointInRing', () => {
  it('detects points inside and outside a ring', () => {
    expect(pointInRing([5, 5], square(0, 10))).toBe(true);
    expect(pointInRing([15, 5], square(0, 10))).toBe(false);
  });
});

describe('pointInFeature', () => {
  it('excludes points inside polygon holes', () => {
    expect(pointInFeature([2, 2], donut)).toBe(true);
    expect(pointInFeature([5, 5], donut)).toBe(false);
  });

  it('handles every polygon of a MultiPolygon', () => {
    expect(pointInFeature([1, 1], islands)).toBe(true);
    expect(pointInFeature([11, 11], islands)).toBe(true);
    expect(pointInFeature([6, 6], islands)).toBe(false);
  });
});

describe('generateDotsInFeature', () => {
  it('only returns points that fall inside the feature', () => {
    const dots = generateDotsInFeature(donut, 1);
    expect(dots.length).toBeGreaterThan(0);
    expect(dots.every((dot) => pointInFeature(dot, donut))).toBe(true);
  });
});
