/**
 * The five Christex Foundation field-survey communities.
 *
 * Positions and radii are now in SVG-space (no lat/lng). The map is gone, so
 * geographic accuracy isn't doing anything for the page — instead we lay the
 * clusters out to use the whole canvas. Aberdeen sits in the upper-left,
 * Grafton in the lower-right (preserving the broad E-W / N-S relationship)
 * but the visible spread is now driven by composition, not geography.
 */

export type CommunityPlacement = {
  /** SVG center, viewBox 1400 × 1100. */
  cx: number;
  cy: number;
  /** Radius in SVG units within which respondent dots are sampled. */
  radiusPx: number;
};

export const COMMUNITY_GEO: Record<string, CommunityPlacement> = {
  // Top row
  Grafton: { cx: 280, cy: 320, radiusPx: 180 },
  "Fourah Bay College": { cx: 1120, cy: 320, radiusPx: 150 },
  // Middle
  Kroobay: { cx: 700, cy: 560, radiusPx: 140 },
  // Bottom row
  Aberdeen: { cx: 280, cy: 830, radiusPx: 130 },
  "Fourah Bay": { cx: 1120, cy: 830, radiusPx: 140 },
};

export const SURVEY_COMMUNITIES = Object.keys(COMMUNITY_GEO);

export type MapLabel = {
  name: string;
  /** SVG position for the label text (anchor: middle). */
  x: number;
  y: number;
};

// Each label sits just above its cluster.
export const MAP_LABELS: MapLabel[] = [
  { name: "Grafton", x: 280, y: 100 },
  { name: "Fourah Bay College", x: 1120, y: 140 },
  { name: "Kroobay", x: 700, y: 400 },
  { name: "Aberdeen", x: 280, y: 670 },
  { name: "Fourah Bay", x: 1120, y: 670 },
];
