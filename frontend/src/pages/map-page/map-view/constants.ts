import type { LineLayerSpecification } from "react-map-gl/maplibre";
import { ZoomLevelInView } from "../../../models/map-models";

export const MAX_ZOOM = 20;
export const DEFAULT_ZOOM = 5;

export const LeftPanelClassName = "left-panel";
export const RightPanelClassName = "right-panel";

export const StreetLineWidth = 12;

export const streetLayerId = "streetSegmentLayer";
export const maxZoomStreetLayerId = "max-zoom-layer";
export const medZoomStreetLayerId = "med-zoom-layer";
export const minZoomStreetLayerId = "min-zoom-layer";
export const streetLayerStyle: LineLayerSpecification = {
  id: streetLayerId,
  type: "line",
  source: "streets",
  layout: {
    "line-cap": "round",
  },
  paint: {
    "line-opacity-transition": {
      duration: 1000,
      delay: 0,
    },
    "line-opacity": 0.3,
    "line-width": StreetLineWidth,
    "line-color": "#738393",
  },
};
export const streetLayerStyles: LineLayerSpecification[] = [
  {
    ...streetLayerStyle,
    id: maxZoomStreetLayerId,
    filter: ["in", ["get", "zoomLevel"], ["literal", [ZoomLevelInView.THREE]]],
    minzoom: 15.5,
  },
  {
    ...streetLayerStyle,
    id: medZoomStreetLayerId,
    filter: ["in", ["get", "zoomLevel"], ["literal", [ZoomLevelInView.TWO]]],
    minzoom: 13.5,
  },
  {
    ...streetLayerStyle,
    id: minZoomStreetLayerId,
    filter: ["in", ["get", "zoomLevel"], ["literal", [ZoomLevelInView.ONE]]],
    minzoom: 0,
  },
];

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
