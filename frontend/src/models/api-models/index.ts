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

export enum collisionSeverity {
  Fatal = "fatal",
  Visible = "other_visible",
  ComplaintOfPain = "complaint_of_pain",
  Medical = "medical",
  Severe = "severe",
}

export enum collisionType {
  OtherCollisionType = "other",
  Overturned = "overturned",
  VehiclePedestiran = "vehicle_pedestrian",
  HitObject = "hit_object",
  RearEnd = "rear_end",
  Broadside = "broadside",
  Sideswipe = "sideswipe",
  NotStated = "not_stated",
  HeadOn = "head_on",
}

export type ViewportSegment = {
  cnn: number;
  street: string;
  line: LineString;
};

export type CrashEvents = {
  cnn: number;
  occuredAt: Date | null;
  collisionSeverity: collisionSeverity | null;
  collisionType: collisionType | null;
  numberKilled: number;
  numberInjured: number;
};
