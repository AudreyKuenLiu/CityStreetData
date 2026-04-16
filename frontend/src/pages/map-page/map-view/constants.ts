import type { LineLayerSpecification } from "react-map-gl/maplibre";

export const MAX_ZOOM = 20;
export const DEFAULT_ZOOM = 5;

export const LeftPanelClassName = "left-panel";
export const RightPanelClassName = "right-panel";

export const StreetLineWidth = 12;

export const streetLayerId = "streetSegmentLayer";
export const streetLayerStyle: LineLayerSpecification = {
  id: streetLayerId,
  type: "line",
  source: "streets",
  layout: {
    "line-cap": "round",
  },
  paint: {
    "line-opacity": 0.3,
    "line-width": StreetLineWidth,
    "line-color": "#738393",
  },
} as const;
export const hoveredLayerId = "hoveredSegmentLayer";
export const hoveredLayerStyle: LineLayerSpecification = {
  id: hoveredLayerId,
  type: "line",
  source: "streets",
  layout: {
    "line-cap": "round",
  },
  paint: {
    "line-opacity": 0.7,
    "line-width": StreetLineWidth,
    "line-color": "#ED7B58",
  },
} as const;

export const highlightedSelectedStreetLayerId =
  "highlightedSelectedStreetSegmentLayer";
export const highlightedSelectedStreetLayerStyle: LineLayerSpecification = {
  id: highlightedSelectedStreetLayerId,
  type: "line",
  source: "streets",
  layout: {
    "line-cap": "round",
  },
  paint: {
    "line-opacity": 0.7,
    "line-width": StreetLineWidth,
    "line-color": "#ED7B58",
  },
} as const;
