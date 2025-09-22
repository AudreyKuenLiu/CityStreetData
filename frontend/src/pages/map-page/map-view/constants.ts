import type { LineLayerSpecification } from "react-map-gl/maplibre";

export const SanFranciscoNWPoint = [
  37.86241254364695, -122.57899808205441,
] as const;
export const SanFranciscoSEPoint = [
  37.64657565635305, -122.30600871794562,
] as const;

export const SanFranciscoCenterLatLon = [37.7544941, -122.4425034] as const;
export const MAX_ZOOM = 18;
export const DEFAULT_ZOOM = 5;

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
