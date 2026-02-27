import { GroupId } from "../street-map-data-form";
import { CrashEventFeatureCollection } from "../../../../models/api-models";
import { FeatureCollection, Point } from "geojson";
import { z } from "zod";
import { CrashMap } from "../../../../models/map-models";
import { UserFields } from "../../context/data-view";

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
  initializeHeatmap: ({
    data,
    selectedStartEndTime,
    selectedStreetGroups,
    selectedTimeSegment,
  }: {
    data: CrashMap;
  } & UserFields) => void;
  setTimeSegmentIdx: ({ newIdx }: { newIdx: number }) => boolean;
  setHeatmapFilter: ({
    heatmapFilter,
  }: {
    heatmapFilter: HeatmapFilter;
  }) => boolean;
  toggleFullTimePeriodDisplay: () => void;
};

export type HeatmapData = {
  groupIdFeatureCollections: (readonly [
    GroupId,
    CrashEventFeatureCollection,
  ])[];
  timeSegmentIdx: number;
  timeSegmentList: Date[];
  fullTimePeriodDisplay: boolean;
  heatmapFilter: HeatmapFilter;
  actions: HeatmapDataActions;
};

export type HeatmapDataState = Omit<HeatmapData, "actions">;
