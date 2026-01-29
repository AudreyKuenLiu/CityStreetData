import { GroupId } from "../street-map-data-form";
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
  setDateFeatureCollectionsIndex: ({ newIdx }: { newIdx: number }) => boolean;
};

export type HeatmapData = {
  heatmapGroupTimeSegments: HeatmapGroupTimeSegments;
  dateFeatureCollectionsIndex: number;
  actions: HeatmapDataActions;
};

export type HeatmapDataState = Omit<HeatmapData, "actions">;
