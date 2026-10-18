import { geoBounds, geoDistance } from 'd3-geo';
import type { Feature, MultiPolygon, Polygon, Position } from 'geojson';

export type LandFeature = Feature<Polygon | MultiPolygon>;

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// Cache de bbox por anillo exterior para descartar poligonos rapido
const boundsCache = new WeakMap<Position[], Bounds>();

const ringBounds = (ring: Position[]): Bounds => {
  const cached = boundsCache.get(ring);
  if (cached) return cached;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const bounds: Bounds = { minX, minY, maxX, maxY };
  boundsCache.set(ring, bounds);
  return bounds;
};

// Ray casting: cuenta cruces de un rayo horizontal con los bordes del anillo
export const pointInRing = ([x, y]: Position, ring: Position[]): boolean => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

const pointInPolygon = (point: Position, polygon: Position[][]): boolean => {
  const [outer, ...holes] = polygon;
  const { minX, minY, maxX, maxY } = ringBounds(outer);
  if (point[0] < minX || point[0] > maxX || point[1] < minY || point[1] > maxY) return false;
  if (!pointInRing(point, outer)) return false;
  return !holes.some((hole) => pointInRing(point, hole));
};

export const pointInFeature = (point: Position, feature: LandFeature): boolean => {
  const { geometry } = feature;
  if (geometry.type === 'Polygon') return pointInPolygon(point, geometry.coordinates);
  return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
};

const normalizeLongitude = (lng: number): number => {
  const wrapped = ((((lng + 180) % 360) + 360) % 360) - 180;
  return wrapped === -180 && lng > 0 ? 180 : wrapped;
};

// Reticula global alineada a multiplos de `step`; maneja features que cruzan el antimeridiano
export const generateDotsInFeature = (feature: LandFeature, step: number): Position[] => {
  const [[minLng, minLat], [rawMaxLng, maxLat]] = geoBounds(feature);
  const maxLng = minLng > rawMaxLng ? rawMaxLng + 360 : rawMaxLng;
  const dots: Position[] = [];
  const latStart = Math.ceil(minLat / step);
  const latEnd = Math.floor(maxLat / step);
  for (let i = Math.ceil(minLng / step); i <= Math.floor(maxLng / step); i++) {
    const rawLng = i * step;
    const lng = normalizeLongitude(rawLng);
    for (let j = latStart; j <= latEnd; j++) {
      const lat = j * step;
      // En antimeridiano el anillo puede venir con longitudes continuas (>180) o normalizadas
      if (
        pointInFeature([lng, lat], feature) ||
        (rawLng !== lng && pointInFeature([rawLng, lat], feature))
      ) {
        dots.push([lng, lat]);
      }
    }
  }
  return dots;
};

// Un punto es visible si esta a menos de 90 grados del centro de la vista
export const isFrontFacing = (coords: [number, number], rotation: [number, number]): boolean =>
  geoDistance(coords, [-rotation[0], -rotation[1]]) < Math.PI / 2;
