import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import { GraphData, GraphDataActions, GraphType } from "./types";
import { actions } from "./actions";

const useGraphData = create<GraphData>()(
  devtools(
    (set) => ({
      graphGroupVehicleCrashes: [],
      graphGroupTrafficInjuriesAndFatalities: [],
      currentGraphType: "InjuriesAndFatalities",
      actions: actions({ setState: set }),
    }),
    { name: "GraphData" }
  )
);

export const useTrafficCrashesData = ():
  | GraphData["graphGroupVehicleCrashes"]
  | GraphData["graphGroupTrafficInjuriesAndFatalities"] => {
  return useGraphData(
    useShallow((state) => {
      if (state.currentGraphType === "CrashGroups") {
        return state.graphGroupVehicleCrashes;
      }
      return state.graphGroupTrafficInjuriesAndFatalities;
    })
  );
};

export const useCurrentGraphType = (): GraphType => {
  return useGraphData((state) => state.currentGraphType);
};

export const useActions = (): GraphDataActions => {
  return useGraphData((state) => state.actions);
};
