import { GroupId, TimeSegments } from "../street-map-data-form";
import { CrashEventFeatureCollection } from "../../../../models/api-models";

export type DateFeatureCollections = (readonly [
  Date,
  CrashEventFeatureCollection,
])[];

export type HeatmapGroupData = Map<GroupId, DateFeatureCollections>;

export type HeatmapGroupTimeSegments = Map<
  GroupId,
  {
    featureCollectionSegments: DateFeatureCollections;
  }
>;

export type HeatmapDataActions = {
  setHeatmapData: ({ data }: { data: HeatmapGroupData }) => void;
  setFeatureCollectionsIndex: ({ newIdx }: { newIdx: number }) => boolean;
  toggleFullTimePeriodDisplay: () => void;
};

export type HeatmapData = {
  heatmapGroupTimeSegments: HeatmapGroupTimeSegments;
  featureCollectionsIndex: number;
  fullTimePeriodDisplay: boolean;
  actions: HeatmapDataActions;
};

export type HeatmapDataState = Omit<HeatmapData, "actions">;
