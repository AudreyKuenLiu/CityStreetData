import type { LineLayerSpecification } from "react-map-gl/maplibre";

export const MAX_ZOOM = 20;
export const DEFAULT_ZOOM = 5;

export const streetLayerId = "streetSegmentLayer";
export const streetLayerStyle: LineLayerSpecification = {
  id: streetLayerId,
  type: "line",
  source: "streets",
  paint: {
    "line-opacity": 0.65,
    "line-width": 10,
    "line-color": "#8686AC",
  },
} as const;

export const highlightedStreetLayerId = "highlightedStreetSegmentLayer";
export const highlightedStreetLayerStyle: LineLayerSpecification = {
  id: highlightedStreetLayerId,
  type: "line",
  source: "streets",
  paint: {
    "line-width": 10,
    "line-color": "#272757",
  },
} as const;
