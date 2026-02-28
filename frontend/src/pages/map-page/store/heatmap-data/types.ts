import { GroupId } from "../street-map-data-form";
import { CrashEventFeatureCollection } from "../../../../models/api-models";
import { FeatureCollection, Point } from "geojson";
import { CrashMap } from "../../../../models/map-models";
import { UserFields } from "../../context/data-view";
import type { InjuryCrashTypeFilter } from "../../types/data-view";

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
    heatmapFilter: InjuryCrashTypeFilter;
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
  heatmapFilter: InjuryCrashTypeFilter;
  actions: HeatmapDataActions;
};

export type HeatmapDataState = Omit<HeatmapData, "actions">;
