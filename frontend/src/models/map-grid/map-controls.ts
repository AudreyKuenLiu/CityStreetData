import type { LineString } from "geojson";

export enum ZoomLevelInView {
  ONE, //least zoomed in
  TWO,
  THREE, //most zoomed in
}

export interface StreetSegment {
  cnn: number;
  line: LineString;
}

export const getZoomLevelInView = (zoomLevel: number): ZoomLevelInView => {
  if (zoomLevel >= 15.5) {
    return ZoomLevelInView.THREE;
  } else if (zoomLevel < 15.5 && zoomLevel >= 13.5) {
    return ZoomLevelInView.TWO;
  }
  return ZoomLevelInView.ONE;
};
