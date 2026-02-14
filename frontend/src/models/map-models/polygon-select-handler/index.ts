import type { Position } from "geojson";
import type { TerraDrawMouseEvent } from "terra-draw";
import { ValidateNotSelfIntersecting } from "terra-draw";
import { bbox, booleanWithin, polygon } from "@turf/turf";
import { StreetSearchTrees } from "../street-search-tree";
import { StreetSegment, ViewableZoomLevels } from "..";

export class PolygonSelectHandler {
  private polygonLine: Position[];
  private streetSearchTrees: StreetSearchTrees;

  constructor({ streetSearchTrees }: { streetSearchTrees: StreetSearchTrees }) {
    this.polygonLine = [];
    this.streetSearchTrees = streetSearchTrees;
  }

  onClickValidator = (event: TerraDrawMouseEvent): boolean => {
    const { lat, lng } = event;
    const newPos: Position = [lng, lat];
    const startPos = this.polygonLine[0];
    const polygonArr =
      startPos != null ? [...this.polygonLine, newPos] : [newPos];

    let valid = true;
    if (polygonArr.length >= 3) {
      const { valid: isValid } = ValidateNotSelfIntersecting(
        polygon([[...polygonArr, polygonArr[0]]]),
      );
      valid = isValid;
    }
    if (valid) {
      console.log("setting polygon line", polygonArr);
      this.polygonLine = polygonArr;
    }
    return valid;
  };

  onFinish = ({ zoomLevel }: { zoomLevel: number }): StreetSegment[] => {
    console.log("this is the polygon line", [
      [...this.polygonLine, this.polygonLine[0]],
    ]);
    const polygonObj = polygon([[...this.polygonLine, this.polygonLine[0]]]);
    const zoomLevelsInView = ViewableZoomLevels(zoomLevel);
    const [minX, minY, maxX, maxY] = bbox(polygonObj);
    const streetSegments = [];
    for (const zoomLevel of zoomLevelsInView) {
      const searchedSegments = this.streetSearchTrees[zoomLevel].search({
        minX,
        minY,
        maxX,
        maxY,
      });

      const containedStreetSegments = searchedSegments.filter(
        (streetSegment) => {
          return booleanWithin(streetSegment.line, polygonObj);
        },
      );
      for (const streetSegment of containedStreetSegments) {
        streetSegments.push(streetSegment);
      }
    }
    return streetSegments;
  };

  onClear = (): void => {
    console.log("calling onclear");
    this.polygonLine = [];
  };
}
