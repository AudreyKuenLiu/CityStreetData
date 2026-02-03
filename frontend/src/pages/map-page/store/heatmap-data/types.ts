import { GroupId } from "../street-map-data-form";
import { CrashEventFeatureCollection } from "../../../../models/api-models";
import { FeatureCollection, Point } from "geojson";
import { z } from "zod";

export type DateFeatureCollections = (readonly [
  Date,
  CrashEventFeatureCollection,
])[];

export type HeatmapFeatureCollection = FeatureCollection<
  Point,
  { dataMagnitude: number } //abstraction over other properties like traffic injuries, severe injuries, car crashes, etc...
>;

export type HeatmapGroupData = Map<GroupId, DateFeatureCollections>;

export type HeatmapGroupTimeSegments = Map<
  GroupId,
  {
    featureCollectionSegments: DateFeatureCollections;
  }
>;

const HeatmapFilterSchema = z.object({
  AllInjuries: "AllInjuries",
  SevereInjuries: "SevereInjuries",
  VehicleInvolvedCrashes: "VehicleInvolvedCrashes",
  BicycleInvolvedCrashes: "BicycleInvolvedCrashes",
  PedestrianInvolvedCrashes: "PedestrianInvolvedCrashes",
} as const);
export const HeatmapFilterKeys = HeatmapFilterSchema.keyof();
export const HeatmapFilterEnum = HeatmapFilterSchema.shape;
export type HeatmapFilter =
  (typeof HeatmapFilterEnum)[keyof typeof HeatmapFilterEnum];

export type HeatmapDataActions = {
  setHeatmapData: ({ data }: { data: HeatmapGroupData }) => void;
  setFeatureCollectionsIndex: ({ newIdx }: { newIdx: number }) => boolean;
  setHeatmapFilter: ({
    heatmapFilter,
  }: {
    heatmapFilter: HeatmapFilter;
  }) => boolean;
  toggleFullTimePeriodDisplay: () => void;
};

export type HeatmapData = {
  heatmapGroupTimeSegments: HeatmapGroupTimeSegments;
  featureCollectionsIndex: number;
  fullTimePeriodDisplay: boolean;
  heatmapFilter: HeatmapFilter;
  actions: HeatmapDataActions;
};

export type HeatmapDataState = Omit<HeatmapData, "actions">;
