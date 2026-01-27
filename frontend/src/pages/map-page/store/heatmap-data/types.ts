import { GroupId } from "../street-map-data-form";
import { CrashEventFeatureCollection } from "../../../../models/api-models";

export type HeatmapGroupData = Map<GroupId, CrashEventFeatureCollection>;

export type HeatmapDataActions = {
  setHeatmapData: (data: HeatmapGroupData) => void;
};

export type HeatmapData = {
  heatmapGroups: HeatmapGroupData;
  actions: HeatmapDataActions;
};

export type HeatmapDataState = Omit<HeatmapData, "actions">;
