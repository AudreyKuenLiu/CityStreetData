import { squareGrid } from "@turf/turf";
import type { Feature, GeoJsonProperties, Polygon } from "geojson";
import { booleanWithin, bboxPolygon, booleanOverlap } from "@turf/turf";

export class CityGrid {
  private cellSizeKilometers: number;
  private cityGrid: Feature<Polygon, GeoJsonProperties>[];
  private gridSort = (
    a: Feature<Polygon, GeoJsonProperties>,
    b: Feature<Polygon, GeoJsonProperties>
  ): number => {
    const [long1, lat1] = a.geometry.coordinates[0][0];
    const [long2, lat2] = b.geometry.coordinates[0][0];
    if (lat1 > lat2) {
      return -1;
    }
    if (lat1 < lat2) {
      return 1;
    }
    if (long1 < long2) {
      return -1;
    }
    if (long1 > long2) {
      return 1;
    }
    return 0;
  };

  constructor({
    cellSizeKilometers,
    cityBBox,
  }: {
    cellSizeKilometers: number;
    cityBBox: [number, number, number, number];
  }) {
    this.cellSizeKilometers = cellSizeKilometers;
    this.cityGrid = [...squareGrid(cityBBox, cellSizeKilometers).features];
    this.cityGrid.sort(this.gridSort);
  }

  getCellsInView({
    bbox,
  }: {
    bbox: [number, number, number, number];
  }): Feature<Polygon, GeoJsonProperties>[] {
    const bboxPoly = bboxPolygon(bbox);
    return this.cityGrid.filter(
      (cell) => booleanWithin(cell, bboxPoly) || booleanOverlap(cell, bboxPoly)
    );
  }
}
