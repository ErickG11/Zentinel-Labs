import { geoBounds } from 'd3-geo';
import type { Feature, MultiPolygon, Polygon, Position } from 'geojson';

export type LandFeature = Feature<Polygon | MultiPolygon>;

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
  if (!pointInRing(point, outer)) return false;
  return !holes.some((hole) => pointInRing(point, hole));
};

export const pointInFeature = (point: Position, feature: LandFeature): boolean => {
  const { geometry } = feature;
  if (geometry.type === 'Polygon') return pointInPolygon(point, geometry.coordinates);
  return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
};

export const generateDotsInFeature = (feature: LandFeature, step: number): Position[] => {
  const [[minLng, minLat], [maxLng, maxLat]] = geoBounds(feature);
  const dots: Position[] = [];
  for (let lng = minLng; lng <= maxLng; lng += step) {
    for (let lat = minLat; lat <= maxLat; lat += step) {
      if (pointInFeature([lng, lat], feature)) dots.push([lng, lat]);
    }
  }
  return dots;
};
