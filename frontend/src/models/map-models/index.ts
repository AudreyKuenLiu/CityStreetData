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
  ONE, //least zoomed in (zoomLevel >= 15.5)
  TWO, // (zoomLevel < 15.5 && zoomLevel >= 13.5)
  THREE, //most zoomed in (zoomLevel < 13.5)
}

export const ViewableZoomLevels = (
  zoomLevel: number,
):
  | [ZoomLevelInView.ONE]
  | [ZoomLevelInView.ONE, ZoomLevelInView.TWO]
  | [ZoomLevelInView.ONE, ZoomLevelInView.TWO, ZoomLevelInView.THREE] => {
  if (zoomLevel >= 15.5) {
    return [ZoomLevelInView.ONE, ZoomLevelInView.TWO, ZoomLevelInView.THREE];
  }
  if (zoomLevel < 15.5 && zoomLevel >= 13.5) {
    return [ZoomLevelInView.ONE, ZoomLevelInView.TWO];
  }
  return [ZoomLevelInView.ONE];
};
