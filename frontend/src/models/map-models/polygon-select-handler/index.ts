import type { Position } from "geojson";
import type { TerraDrawMouseEvent } from "terra-draw";
import { ValidateNotSelfIntersecting } from "terra-draw";
import { bbox, booleanWithin, polygon } from "@turf/turf";
import { StreetSearchTrees, StreetSegmentRBush } from "../street-search-tree";
import { StreetSegment, ViewableZoomLevels } from "..";

export class PolygonSelectHandler {
  private polygonLine: Position[];
  private streetSearchTrees: StreetSearchTrees;
  private selectedStreetTree: StreetSegmentRBush;

  constructor({
    streetSearchTrees,
    selectedStreets,
  }: {
    streetSearchTrees: StreetSearchTrees;
    selectedStreets: StreetSegmentRBush;
  }) {
    this.polygonLine = [];
    this.streetSearchTrees = streetSearchTrees;
    this.selectedStreetTree = selectedStreets;
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
      this.polygonLine = polygonArr;
    }
    return valid;
  };

  onFinish = ({ zoomLevel }: { zoomLevel: number }): StreetSegment[] => {
    const polygonObj = polygon([[...this.polygonLine, this.polygonLine[0]]]);
    const zoomLevelsInView = ViewableZoomLevels(zoomLevel);
    const [minX, minY, maxX, maxY] = bbox(polygonObj);
    const streetSegmentMap = new Map<number, StreetSegment>();
    const searchTrees = [this.selectedStreetTree];
    for (const zoomLevel of zoomLevelsInView) {
      searchTrees.push(this.streetSearchTrees[zoomLevel]);
    }
    for (const searchTree of searchTrees) {
      const searchedSegments = searchTree.search({
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
        streetSegmentMap.set(streetSegment.cnn, streetSegment);
      }
    }

    this.onClear();
    return Array.from(streetSegmentMap.entries()).map(([_, segment]) => {
      return segment;
    });
  };

  onClear = (): void => {
    this.polygonLine = [];
  };
}
