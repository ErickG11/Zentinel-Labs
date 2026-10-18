import type { Feature, MultiPolygon, Polygon } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  generateDotsInFeature,
  isFrontFacing,
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

describe('generateDotsInFeature grid', () => {
  it('keeps no dot inside the hole and produces the expected count', () => {
    const dots = generateDotsInFeature(donut, 1);
    expect(dots.some(([lng, lat]) => lng > 4 && lng < 6 && lat > 4 && lat < 6)).toBe(false);
    // 100 puntos en [0,10) x [0,10) menos 4 dentro del agujero [4,6) x [4,6)
    expect(dots.length).toBe(96);
  });

  it('aligns dots to a global grid without duplicates between neighbours', () => {
    const left: Feature<Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [square(0, 5)] },
    };
    const right: Feature<Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [5.001, 0],
            [10, 0],
            [10, 5],
            [5.001, 5],
            [5.001, 0],
          ],
        ],
      },
    };
    const step = 1.28;
    const dots = [...generateDotsInFeature(left, step), ...generateDotsInFeature(right, step)];
    const keys = dots.map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(
      dots.every(
        ([lng, lat]) =>
          Math.abs(lng / step - Math.round(lng / step)) < 1e-9 &&
          Math.abs(lat / step - Math.round(lat / step)) < 1e-9,
      ),
    ).toBe(true);
  });

  it('handles features crossing the antimeridian', () => {
    const crossing: Feature<Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [170, 0],
            [170, 10],
            [190, 10],
            [190, 0],
            [170, 0],
          ],
        ],
      },
    };
    const dots = generateDotsInFeature(crossing, 2);
    expect(dots.length).toBeGreaterThan(0);
    expect(dots.some(([lng]) => lng > 170)).toBe(true);
    expect(dots.some(([lng]) => lng < -170)).toBe(true);
    expect(dots.every(([lng]) => lng >= -180 && lng <= 180)).toBe(true);
    expect(dots.every((dot) => Math.abs(dot[0]) >= 170)).toBe(true);
  });
});

describe('isFrontFacing', () => {
  it('is true for the view centre and false for its antipode', () => {
    expect(isFrontFacing([79, 0], [-79, 0])).toBe(true);
    expect(isFrontFacing([-101, 0], [-79, 0])).toBe(false);
  });

  it('treats the horizon as not front facing', () => {
    expect(isFrontFacing([90, 0], [0, 0])).toBe(false);
    expect(isFrontFacing([89, 0], [0, 0])).toBe(true);
  });

  it('accounts for pitch', () => {
    // vista inclinada hacia el polo norte: el polo es visible, el sur no
    expect(isFrontFacing([0, 80], [0, -60])).toBe(true);
    expect(isFrontFacing([0, -80], [0, -60])).toBe(false);
  });

  it('matches the Santo Domingo pin with the default rotation', () => {
    expect(isFrontFacing([-79.17, -0.25], [79, 0])).toBe(true);
    expect(isFrontFacing([100.83, 0.25], [79, 0])).toBe(false);
  });
});
