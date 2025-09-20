import type { LineLayerSpecification } from "react-map-gl/maplibre";

export const SanFranciscoBoundsLatLon = [
  -122.579989, 37.647624, -122.3074, 37.86348,
] satisfies [number, number, number, number];

export const SanFranciscoCenterLatLon = [37.756212, -122.443696] as const;

export const streetLayerId = "streetSegmentLayer";
export const streetLayerStyle: LineLayerSpecification = {
  id: streetLayerId,
  type: "line",
  source: "streets",
  paint: {
    "line-width": 5,
    "line-color": "#8686AC",
  },
} as const;

export const highlightedStreetLayerId = "highlightedStreetSegmentLayer";
export const highlightedStreetLayerStyle: LineLayerSpecification = {
  id: highlightedStreetLayerId,
  type: "line",
  source: "streets",
  paint: {
    "line-width": 5,
    "line-color": "#272757",
  },
} as const;
