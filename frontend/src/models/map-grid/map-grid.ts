import type { Feature, GeoJsonProperties, Polygon, Position } from "geojson";
import { squareGrid } from "@turf/turf";

class CityCell {
  NE: Position;
  NW: Position;
  SW: Position;
  SE: Position;
  constructor({ cellPositions }: { cellPositions: Position[] }) {
    this.SW = [...cellPositions[0]];
    this.SE = [...cellPositions[1]];
    this.NE = [...cellPositions[2]];
    this.NW = [...cellPositions[3]];
  }
}

//type CityGridArray = Feature<Polygon, GeoJsonProperties>[];
type CityGridArray = CityCell[][];
//Bounding box must be in coordinates in the form of North, East, South, West
export type BoundingBox = [number, number, number, number];

export class CityGrid {
  private cityGrid: CityGridArray;
  private gridSort = (
    a: Feature<Polygon, GeoJsonProperties>,
    b: Feature<Polygon, GeoJsonProperties>
  ): number => {
    const [lat1, long1] = a.geometry.coordinates[0][0];
    const [lat2, long2] = b.geometry.coordinates[0][0];
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

  private buildCityGrid({
    cityBBox,
    cellSizeKilometers,
  }: {
    cellSizeKilometers: number;
    cityBBox: BoundingBox;
  }): CityGridArray {
    const cityGrid = [...squareGrid(cityBBox, cellSizeKilometers).features];
    cityGrid.sort(this.gridSort);
    const cityRows: CityCell[][] = [];
    let currentLatitude = cityGrid[0].geometry.coordinates[0][0][0];
    let currentRow: CityCell[] = [];
    let i = 0;
    do {
      const coordinates = cityGrid[i].geometry.coordinates;
      const latitude = coordinates[0][0][0];
      if (currentLatitude !== latitude) {
        cityRows.push([...currentRow]);
        currentRow = [];
        currentLatitude = latitude;
      }
      currentRow.push(new CityCell({ cellPositions: coordinates[0] }));
      i += 1;
    } while (i < cityGrid.length);
    cityRows.push([...currentRow]);
    console.log("these are the city rows", cityRows);

    return cityRows;
  }

  private getCellIndexOnGrid({
    lat,
    long,
    minLatOrLon,
    maxLatOrLon,
    cellLength,
  }: {
    lat?: number;
    long?: number;
    minLatOrLon: number;
    maxLatOrLon: number;
    cellLength: number;
  }): number {
    const latOrLon = lat ?? long;
    if (latOrLon == null || (lat != null && long != null)) {
      return -1;
    }
    if (latOrLon <= minLatOrLon) {
      return lat != null ? this.cityGrid.length - 1 : 0;
    }
    if (latOrLon >= maxLatOrLon) {
      return lat != null ? 0 : this.cityGrid[0].length - 1;
    }
    const baseLatOrLon = latOrLon - minLatOrLon;
    const index = Math.abs(Math.floor(baseLatOrLon / cellLength));
    console.log(
      "this is the calculation",
      latOrLon,
      minLatOrLon,
      maxLatOrLon,
      baseLatOrLon,
      cellLength,
      index
    );
    return lat != null ? this.cityGrid.length - 1 - index : index;
  }

  constructor({
    cellSizeKilometers,
    cityBBox,
  }: {
    cellSizeKilometers: number;
    cityBBox: BoundingBox;
  }) {
    this.cityGrid = this.buildCityGrid({ cityBBox, cellSizeKilometers });
  }

  getBoundingBoxInView({ bbox }: { bbox: BoundingBox }): BoundingBox {
    const NECityCell = this.cityGrid[0][this.cityGrid[0].length - 1];
    const SWCityCell = this.cityGrid[this.cityGrid.length - 1][0];
    const cellHeight = Math.abs(NECityCell.NE[0] - NECityCell.SE[0]);
    const cellWidth = Math.abs(NECityCell.NE[1] - NECityCell.NW[1]);

    const NEBBoxCellIndex = [
      this.getCellIndexOnGrid({
        lat: bbox[0],
        minLatOrLon: SWCityCell.SW[0],
        maxLatOrLon: NECityCell.NE[0],
        cellLength: cellHeight,
      }),
      this.getCellIndexOnGrid({
        long: bbox[1],
        minLatOrLon: SWCityCell.SW[1],
        maxLatOrLon: NECityCell.NE[1],
        cellLength: cellWidth,
      }),
    ];
    const SWBBoxCellIndex = [
      this.getCellIndexOnGrid({
        lat: bbox[2],
        minLatOrLon: SWCityCell.SW[0],
        maxLatOrLon: NECityCell.NE[0],
        cellLength: cellHeight,
      }),
      this.getCellIndexOnGrid({
        long: bbox[3],
        minLatOrLon: SWCityCell.SW[1],
        maxLatOrLon: NECityCell.NE[1],
        cellLength: cellWidth,
      }),
    ];

    const NEBBoxCell = this.cityGrid[NEBBoxCellIndex[0]][NEBBoxCellIndex[1]];
    const SWBBoxCell = this.cityGrid[SWBBoxCellIndex[0]][SWBBoxCellIndex[1]];
    console.log(
      "returning values",
      NEBBoxCellIndex[0],
      NEBBoxCellIndex[1],
      NEBBoxCell
    );

    return [
      NEBBoxCell.NE[0],
      NEBBoxCell.NE[1],
      SWBBoxCell.SW[0],
      SWBBoxCell.SW[1],
    ];
  }
}
