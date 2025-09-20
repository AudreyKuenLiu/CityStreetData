import { SanFranciscoBoundsLatLon } from "../constants";
import type { Feature, Geometry } from "geojson";
import { CityGrid } from "../../../../models/mapGrid";

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
  if (zoomLevel >= 16) {
    return SanFranciscoGridMaxZoom;
  } else if (zoomLevel < 16 && zoomLevel >= 14) {
    return SanFranciscoGridMedZoom;
  }
  return SanFranciscoGridMinZoom;
};

export const getCellsInSanFranciscoBoundingBox = ({
  bbox,
  zoomLevel,
}: {
  bbox: [number, number, number, number];
  zoomLevel: number;
}): Feature<Geometry>[] => {
  const sfGrid = getSanFranciscoGrid(zoomLevel);
  return sfGrid.getCellsInView({ bbox });
};
