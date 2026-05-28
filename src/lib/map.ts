import { geoMercator, geoPath, type GeoProjection } from "d3-geo";
import bbox from "@turf/bbox";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";
import { point as turfPoint } from "@turf/helpers";

export const MAP_VIEW = { width: 1400, height: 1100 };

// Manual scale/translate is used because the geoBoundaries polygons have a
// winding-order quirk that breaks d3-geo's `fitExtent` (it returns world bounds).
// Center is the midpoint of the Western Area peninsula bbox; scale was tuned to
// span the available viewport with ~16px padding.
// Centered on the bbox of the five survey communities (Aberdeen → Grafton).
const CENTER: [number, number] = [-13.180, 8.440];
const SCALE = 300000;

export function buildProjection(
  width = MAP_VIEW.width,
  height = MAP_VIEW.height,
): GeoProjection {
  return geoMercator()
    .center(CENTER)
    .translate([width / 2, height / 2])
    .scale(SCALE);
}

export function projectionPath(projection: GeoProjection) {
  return geoPath(projection);
}

/** Sample one [lng, lat] uniformly inside a (Multi)Polygon feature. */
export function randomPointInFeature(
  feature: Feature<Polygon | MultiPolygon>,
  rng: () => number,
): [number, number] {
  const [minX, minY, maxX, maxY] = bbox(feature) as [
    number,
    number,
    number,
    number,
  ];
  for (let i = 0; i < 300; i++) {
    const lng = minX + rng() * (maxX - minX);
    const lat = minY + rng() * (maxY - minY);
    if (booleanPointInPolygon(turfPoint([lng, lat]), feature)) {
      return [lng, lat];
    }
  }
  // Fallback: bbox centroid (rare — only on weird geometry)
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

/** Sample one [lng, lat] uniformly inside a circle of radius `radiusM` metres. */
export function randomPointInCircle(
  centerLng: number,
  centerLat: number,
  radiusM: number,
  rng: () => number,
): [number, number] {
  // Approximate metres → degrees. 1 deg lat ≈ 111111 m; 1 deg lng ≈ 111111 m * cos(lat).
  const r = radiusM * Math.sqrt(rng()); // uniform in disk
  const theta = rng() * 2 * Math.PI;
  const dLat = (r * Math.cos(theta)) / 111111;
  const dLng = (r * Math.sin(theta)) / (111111 * Math.cos((centerLat * Math.PI) / 180));
  return [centerLng + dLng, centerLat + dLat];
}

/** Build a name → feature map for fast polygon lookup. */
export function indexFeatures(
  collection: FeatureCollection,
): Map<string, Feature<Polygon | MultiPolygon>> {
  const map = new Map<string, Feature<Polygon | MultiPolygon>>();
  for (const f of collection.features) {
    const name = (f.properties as { shapeName?: string } | null)?.shapeName;
    if (!name) continue;
    if (
      f.geometry &&
      (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
    ) {
      map.set(name, f as Feature<Polygon | MultiPolygon>);
    }
  }
  return map;
}
