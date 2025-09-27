import { LineString } from "geojson";

export enum classcode {
  Other,
  Freeways,
  HighwayOrMajorStreet,
  Arterial,
  Collector,
  Residential,
  FreewayRamp,
}

export type ViewPortSegment = {
  cnn: number;
  street: string;
  line: LineString;
};
