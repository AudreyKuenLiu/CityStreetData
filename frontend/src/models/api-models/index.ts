import { FeatureCollection, LineString, Point } from "geojson";
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
export const ClassCodeEnum = classCodeSchema.shape;
export type ClassCode = (typeof ClassCodeEnum)[keyof typeof ClassCodeEnum];

export const CollisionSeveritySchema = z.object({
  Fatal: "fatal",
  OtherVisible: "other_visible",
  ComplaintOfPain: "complaint_of_pain",
  Medical: "medical",
  Severe: "severe",
} as const);
export const CollisionSeverityEnum = CollisionSeveritySchema.shape;
export type CollisionSeverity = z.infer<typeof CollisionSeveritySchema>;

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

export const crashClassificationSchema = z.object({
  BicycleOnly: "FF",
  VehiclesOnly: "AA",
  VehicleBicycle: "CC",
  VehiclePedestrian: "BB",
  Unknown: "II",
  BicycleParkedCar: "EE",
  BicyclePedestrian: "DD",
  PedestrianOnly: "GG",
  VehicleBicyclePedestrian: "BB CC",
  BicycleUnknown: "HH",
} as const);
export const CrashClassificationEnum = crashClassificationSchema.shape;
export type CrashClassification =
  (typeof CrashClassificationEnum)[keyof typeof CrashClassificationEnum];

export type StreetSegment = {
  cnn: number;
  street: string;
  line: LineString;
};

export type ApiCrashEvents = {
  cnn: number;
  occured_at: number;
  crash_classification: CrashClassification;
  collision_severity: string | null;
  collision_type: string | null;
  number_killed: number;
  number_injured: number;
};

export type CrashStats = {
  number_killed: number;
  number_injured: number;
  number_severely_injured: number;
  number_of_crashes: number;
  number_of_vehicle_only_crashes: number;
  number_of_bicycle_only_crashes: number;
  number_of_vehicle_bicycle_crashes: number;
  number_of_vehicle_pedestrian_crashes: number;
  number_of_bicycle_pedestrian_crashes: number;
};

export type CrashEventFeatureCollection = FeatureCollection<
  Point,
  ApiCrashEvents
>;

export const streetFeatureTypeSchema = z.literal(["SpeedLimit"]);
export type StreetFeatureType = z.infer<typeof streetFeatureTypeSchema>;

export type StreetFeature = {
  featureType: StreetFeatureType;
  cnn: number;
  value: string;
};
