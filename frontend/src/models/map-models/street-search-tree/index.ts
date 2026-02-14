import RBush, { BBox } from "rbush";
import { StreetSegment, ZoomLevelInView } from "..";
import { bbox } from "@turf/turf";

export class StreetSegmentRBush extends RBush<StreetSegment> {
  toBBox = (item: StreetSegment): BBox => {
    const [minX, minY, maxX, maxY] = bbox(item.line);
    return {
      minX,
      minY,
      maxX,
      maxY,
    };
  };
  compareMinX = (a: StreetSegment, b: StreetSegment): number => {
    const { minX: aMinX } = this.toBBox(a);
    const { minX: bMinX } = this.toBBox(b);
    return aMinX - bMinX;
  };
  compareMinY = (a: StreetSegment, b: StreetSegment): number => {
    const { minY: aMinY } = this.toBBox(a);
    const { minY: bMinY } = this.toBBox(b);
    return aMinY - bMinY;
  };
}

export type StreetSearchTrees = {
  [ZoomLevelInView.ONE]: StreetSegmentRBush;
  [ZoomLevelInView.TWO]: StreetSegmentRBush;
  [ZoomLevelInView.THREE]: StreetSegmentRBush;
};
