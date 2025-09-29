import type {
  Feature,
  GeoJsonProperties,
  LineString,
  Polygon,
  Position,
} from "geojson";
import { booleanCrosses, booleanWithin, polygon, squareGrid } from "@turf/turf";

export interface StreetSegment {
  cnn: number;
  line: LineString;
}

class CityCell {
  NE: Position;
  NW: Position;
  SW: Position;
  SE: Position;
  streetSegments: StreetSegment[];
  constructor({ cellPositions }: { cellPositions: Position[] }) {
    this.SW = [...cellPositions[0]];
    this.SE = [...cellPositions[1]];
    this.NE = [...cellPositions[2]];
    this.NW = [...cellPositions[3]];
    this.streetSegments = [];
  }
  private isWithinOrCrossesCell(line: LineString): boolean {
    const cellPolygon = polygon([
      [
        [this.NE[1], this.NE[0]],
        [this.NW[1], this.NE[0]],
        [this.SW[1], this.SW[0]],
        [this.SE[1], this.SE[0]],
        [this.NE[1], this.NE[0]],
      ],
    ]);
    return (
      booleanWithin(line, cellPolygon) || booleanCrosses(line, cellPolygon)
    );
  }
  addStreetSegment(streetSegment: StreetSegment): boolean {
    if (this.isWithinOrCrossesCell(streetSegment.line)) {
      this.streetSegments.push(streetSegment);
      return true;
    }
    return false;
  }
}

//type CityGridArray = Feature<Polygon, GeoJsonProperties>[];
type CityGridArray = CityCell[][];
//Bounding box must be in coordinates in the form of South, West, North, East,
export type BoundingBox = [number, number, number, number];
interface CityGridInput {
  cellSizeKilometers: number;
  cityBBox: BoundingBox;
  streetSegments?: StreetSegment[];
}

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
    return lat != null ? this.cityGrid.length - 1 - index : index;
  }

  private mapStreetSegmentsToGrid(streetSegments: StreetSegment[]): void {
    for (let i = 0; i < this.cityGrid.length; i++) {
      for (let j = 0; j < this.cityGrid[i].length; j++) {
        for (const streetSegment of streetSegments) {
          this.cityGrid[i][j].addStreetSegment(streetSegment);
        }
      }
    }
  }

  private getBoundBoxCells({
    bbox,
  }: {
    bbox: BoundingBox;
  }): //Returns NE, SW Cells
  {
    NEBBoxCell: CityCell;
    SWBBoxCell: CityCell;
    NEBBoxCellIndex: [number, number];
    SWBBoxCellIndex: [number, number];
  } {
    const NECityCell = this.cityGrid[0][this.cityGrid[0].length - 1];
    const SWCityCell = this.cityGrid[this.cityGrid.length - 1][0];
    const cellHeight = Math.abs(NECityCell.NE[0] - NECityCell.SE[0]);
    const cellWidth = Math.abs(NECityCell.NE[1] - NECityCell.NW[1]);

    const NEBBoxCellIndex: [number, number] = [
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
    ] as const;
    const SWBBoxCellIndex: [number, number] = [
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
    ] as const;

    const NEBBoxCell = this.cityGrid[NEBBoxCellIndex[0]][NEBBoxCellIndex[1]];
    const SWBBoxCell = this.cityGrid[SWBBoxCellIndex[0]][SWBBoxCellIndex[1]];
    return { NEBBoxCell, SWBBoxCell, NEBBoxCellIndex, SWBBoxCellIndex };
  }

  constructor({ cellSizeKilometers, cityBBox, streetSegments }: CityGridInput) {
    this.cityGrid = this.buildCityGrid({ cityBBox, cellSizeKilometers });
    const startTime = Date.now(); // Or new Date().getTime()
    this.mapStreetSegmentsToGrid(streetSegments ?? []);
    const endTime = Date.now();
    console.log(`Method execution time: ${endTime - startTime} milliseconds`);
  }

  getStreetSegmentsInView({ bbox }: { bbox: BoundingBox }): StreetSegment[] {
    const { NEBBoxCellIndex, SWBBoxCellIndex } = this.getBoundBoxCells({
      bbox,
    });
    const streetSegmentMap: { [cnn: string]: StreetSegment } = {};

    let i = NEBBoxCellIndex[0];
    while (i <= SWBBoxCellIndex[0]) {
      let j = SWBBoxCellIndex[1];
      while (j <= NEBBoxCellIndex[1]) {
        const streetSegments = this.cityGrid[i][j].streetSegments;
        for (const streetSegment of streetSegments) {
          streetSegmentMap[streetSegment.cnn] = streetSegment;
        }
        j += 1;
      }
      i += 1;
    }

    return Object.entries(streetSegmentMap).map(([, streetSegment]) => {
      return streetSegment;
    });
  }

  getBoundingBoxInView({ bbox }: { bbox: BoundingBox }): BoundingBox {
    const { NEBBoxCell, SWBBoxCell } = this.getBoundBoxCells({ bbox });
    return [
      NEBBoxCell.NE[0],
      NEBBoxCell.NE[1],
      SWBBoxCell.SW[0],
      SWBBoxCell.SW[1],
    ];
  }
}

export const InitializeCityGrid = ({
  cellSizeKilometers,
  cityBBox,
  streetSegments,
}: CityGridInput): CityGrid => {
  return new CityGrid({ cellSizeKilometers, cityBBox, streetSegments });
};
