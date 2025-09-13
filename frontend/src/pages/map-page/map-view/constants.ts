import type { LineLayerSpecification } from "react-map-gl/maplibre";

export const SanFranciscoBoundsLatLon = [
  -122.62173, 37.649452, -122.271884, 37.87798,
] satisfies [number, number, number, number];

export const SanFranciscoCenterLatLon = [-122.446465, 37.754811] as const;

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
