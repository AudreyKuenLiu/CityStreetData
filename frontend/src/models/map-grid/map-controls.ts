import {
  SanFranciscoNWPoint,
  SanFranciscoSEPoint,
} from "../../constants/map-dimensions";
import { CityGrid } from "./map-grid";
import type { BoundingBox } from "./map-grid";

enum ZoomLevelInView {
  ONE,
  TWO,
  THREE,
}

export const SanFranciscoBoundsLatLon = [
  SanFranciscoSEPoint[0],
  SanFranciscoNWPoint[1],
  SanFranciscoNWPoint[0],
  SanFranciscoSEPoint[1],
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
  if (zoomLevel >= 16) {
    return ZoomLevelInView.THREE;
  } else if (zoomLevel < 16 && zoomLevel >= 14) {
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
