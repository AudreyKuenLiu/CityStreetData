import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import { GraphData, GroupLineData, GraphDataActions } from "./types";
import { actions } from "./actions";

const useGraphData = create<GraphData>()(
  devtools(
    (set) => ({
      graphGroupVehicleCrashes: [],
      graphGroupTrafficCrashesAndFatalities: [],
      actions: actions({ setState: set }),
    }),
    { name: "GraphData" }
  )
);

export const useTrafficCrashesData = (): GroupLineData<
  ["Fatalities", "Severe Injuries", "Injuries", "Vehicle Crashes"]
> => {
  return useGraphData(
    useShallow((state) => {
      return state.graphGroupTrafficCrashesAndFatalities;
    })
  );
};

export const useActions = (): GraphDataActions => {
  return useGraphData((state) => state.actions);
};
