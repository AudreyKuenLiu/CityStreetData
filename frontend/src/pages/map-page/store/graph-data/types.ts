import { GroupId } from "../street-map-data-form";
import { CrashStats, StreetFeature } from "../../../../models/api-models";

export type DateCrashStats = readonly [Date, CrashStats];
export type GraphGroupData = Map<GroupId, DateCrashStats[]>;
export type GraphGroupFeatures = Map<
  GroupId,
  readonly [Date, Map<StreetFeature, string>][]
>;

export type LineData = {
  x: Date;
  y: number;
};

export type GraphDataActions = {
  setGraphData: (data: GraphGroupData) => void;
};

export type GraphData = {
  graphGroupVehicleCrashes: GroupLineData<["Vehicle Crashes"]>;
  graphGroupTrafficCrashesAndFatalities: GroupLineData<
    ["Fatalities", "Severe Injuries", "Injuries"]
  >;
  actions: GraphDataActions;
};

export type GroupLineData<T extends string[]> = (readonly [
  GroupId,
  Date[],
  readonly {
    readonly id: T[number];
    readonly data: LineData[];
    readonly color: string;
  }[],
])[];

export type GraphDataState = Omit<GraphData, "actions">;
