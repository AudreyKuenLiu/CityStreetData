import { LineString } from "geojson";
import { z } from "zod";

export const classCodeSchema = z.object({
  Other: 0,
  Freeways: 1,
  HighwayOrMajorStreet: 2,
  Arterial: 3,
  Collector: 4,
  Residential: 5,
  FreewayRamp: 6,
} as const);
export const classCode = classCodeSchema.shape;
export type classCode = (typeof classCode)[keyof typeof classCode];

export const collisionSeveritySchema = z.literal([
  "fatal",
  "other_visible",
  "complaint_of_pain",
  "medical",
  "severe",
]);
export type collisionSeverity = z.infer<typeof collisionSeveritySchema>;

export const collisionTypeSchema = z.literal([
  "other",
  "overturned",
  "vehicle_pedestrian",
  "hit_object",
  "rear_end",
  "broadside",
  "sideswipe",
  "not_stated",
  "head_on",
]);
export type collisionType = z.infer<typeof collisionTypeSchema>;

export type ViewportSegment = {
  cnn: number;
  street: string;
  line: LineString;
};

export type ApiCrashEvents = {
  cnn: number;
  occured_at: string | null;
  collision_severity: string | null;
  collision_type: string | null;
  number_killed: number;
  number_injured: number;
};

export type CrashEvents = {
  cnn: number;
  occuredAt: Date | null;
  collisionSeverity: collisionSeverity | null;
  collisionType: collisionType | null;
  numberKilled: number;
  numberInjured: number;
};
