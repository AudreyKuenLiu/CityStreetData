import type { LineLayerSpecification } from "react-map-gl/maplibre";

export const MAX_ZOOM = 20;
export const DEFAULT_ZOOM = 5;

export const streetLayerId = "streetSegmentLayer";
export const streetLayerStyle: LineLayerSpecification = {
  id: streetLayerId,
  type: "line",
  source: "streets",
  layout: {
    "line-cap": "round",
  },
  paint: {
    "line-opacity": 0.4,
    "line-width": 15,
    //"line-color": "#8686AC",
    //"line-color": "#98A869",
    "line-color": "#6D8196",
    //"line-color": "#FFC067",
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
    "line-width": 15,
    //"line-color": "#8686AC",
    //"line-color": "#98A869",
    //"line-color": "#6D8196",
    "line-color": "#ED7B58",
  },
} as const;

export const selectedStreetLayerId = "selectedStreetSegmentLayer";
export const selectedStreetLayerStyle: LineLayerSpecification = {
  id: selectedStreetLayerId,
  type: "line",
  source: "streets",
  layout: {
    "line-cap": "round",
  },
  paint: {
    "line-opacity": 0.9,
    "line-width": 15,
    //"line-color": "#FFC067",
    "line-color": "#272757",
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
    "line-width": 15,
    "line-color": "#ED7B58",
  },
} as const;
