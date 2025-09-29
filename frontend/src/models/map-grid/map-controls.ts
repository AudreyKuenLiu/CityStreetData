import {
  SanFranciscoNEPoint,
  SanFranciscoSWPoint,
} from "../../constants/map-dimensions";
import { CityGrid } from "./map-grid";
import type { BoundingBox } from "./map-grid";

export enum ZoomLevelInView {
  ONE, //least zoomed in
  TWO,
  THREE, //most zoomed in
}

//in the form of S, W, N, E
const SanFranciscoBoundsLatLon = [
  SanFranciscoSWPoint[0],
  SanFranciscoSWPoint[1],
  SanFranciscoNEPoint[0],
  SanFranciscoNEPoint[1],
] satisfies [number, number, number, number];

const SanFranciscoGridMaxZoom = new CityGrid({
  cityBBox: SanFranciscoBoundsLatLon,
  cellSizeKilometers: 0.5,
});
const SanFranciscoGridMedZoom = new CityGrid({
  cityBBox: SanFranciscoBoundsLatLon,
  cellSizeKilometers: 2,
});
const SanFranciscoGridMinZoom = new CityGrid({
  cityBBox: SanFranciscoBoundsLatLon,
  cellSizeKilometers: 4,
});

const getSanFranciscoGrid = (zoomLevel: number): CityGrid => {
  const zoomLevelInView = getZoomLevelInView(zoomLevel);
  if (zoomLevelInView === ZoomLevelInView.THREE) {
    return SanFranciscoGridMaxZoom;
  } else if (zoomLevelInView === ZoomLevelInView.TWO) {
    return SanFranciscoGridMedZoom;
  }
  return SanFranciscoGridMinZoom;
};

export const getZoomLevelInView = (zoomLevel: number): ZoomLevelInView => {
  if (zoomLevel >= 15) {
    return ZoomLevelInView.THREE;
  } else if (zoomLevel < 15 && zoomLevel >= 13) {
    return ZoomLevelInView.TWO;
  }
  return ZoomLevelInView.ONE;
};

export const getBoundingBoxInView = ({
  bbox,
  zoomLevel,
}: {
  //in the order of WS, EN OR (minX, minY, maxX, maxY)
  bbox: [number, number, number, number];
  zoomLevel: number;
}): BoundingBox => {
  const sfGrid = getSanFranciscoGrid(zoomLevel);
  return sfGrid.getBoundingBoxInView({ bbox });
};
