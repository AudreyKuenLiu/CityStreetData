import { GroupId } from "../street-map-data-form";
import { CrashStats, StreetFeature } from "../../../../models/api-models";

export type DateCrashStats = readonly [Date, CrashStats];
export type GraphGroupData = Map<
  GroupId,
  { totalMiles: number; dateCrashStats: DateCrashStats[] }
>;
export type GraphGroupFeatures = Map<
  GroupId,
  readonly [Date, Map<StreetFeature, string>][]
>;

export type GraphDataActions = {
  setGraphData: (data: GraphGroupData) => void;
  toggleNormalize: () => void;
  selectCurrentGraph: (graphType: GraphType) => void;
};

export type GraphType = "CrashGroups" | "InjuriesAndFatalities";

export type GraphData = {
  graphGroupData: GraphGroupData;
  shouldNormalize: boolean;
  currentGraphType: GraphType;
  actions: GraphDataActions;
};

export type GraphDataState = Omit<GraphData, "actions">;
