import { StoreApi } from "zustand";
import { GraphData, GraphDataActions, GraphGroupData } from "./types";

export const actions = ({
  setState,
}: Pick<StoreApi<GraphData>, "setState">): GraphDataActions => ({
  setGraphData: (data: GraphGroupData): void => {
    setState(() => {
      return {
        graphGroupData: data,
        // graphGroupVehicleCrashes: initializeVehicleCrashesData(data),
        // graphGroupTrafficInjuriesAndFatalities:
        //   initializeTrafficInjuriesAndFatalitiesData(data),
      };
    });
  },
  selectCurrentGraph: (graphType): void => {
    setState(() => {
      return {
        currentGraphType: graphType,
      };
    });
  },
  toggleNormalize: (): void => {
    setState((state) => {
      return {
        shouldNormalize: !state.shouldNormalize,
      };
    });
  },
});
