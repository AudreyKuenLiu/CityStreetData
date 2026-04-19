import { LineString } from "geojson";
import { ApiCrashEventPoint } from "../api-models";

export interface StreetSegment {
  cnn: number;
  f_node_cnn: number | null;
  t_node_cnn: number | null;
  line: LineString;
}

export type CrashMap = Map<number, ApiCrashEventPoint[]>;

export enum ZoomLevelInView {
  ONE, //least zoomed in (zoomLevel >= 16)
  TWO, // (zoomLevel < 16 && zoomLevel >= 14)
  THREE, //most zoomed in (zoomLevel < 14)
}

export const ViewableZoomLevels = (
  zoomLevel: number,
):
  | [ZoomLevelInView.ONE]
  | [ZoomLevelInView.ONE, ZoomLevelInView.TWO]
  | [ZoomLevelInView.ONE, ZoomLevelInView.TWO, ZoomLevelInView.THREE] => {
  if (zoomLevel >= 16) {
    return [ZoomLevelInView.ONE, ZoomLevelInView.TWO, ZoomLevelInView.THREE];
  }
  if (zoomLevel < 16 && zoomLevel >= 14) {
    return [ZoomLevelInView.ONE, ZoomLevelInView.TWO];
  }
  return [ZoomLevelInView.ONE];
};

export const ViewableZoomLevel = (zoomLevel: number): ZoomLevelInView => {
  if (zoomLevel >= 15.5) {
    return ZoomLevelInView.THREE;
  }
  if (zoomLevel < 15.5 && zoomLevel >= 13.5) {
    return ZoomLevelInView.TWO;
  }
  return ZoomLevelInView.ONE;
};
