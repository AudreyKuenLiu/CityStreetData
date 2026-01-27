import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import type {
  HeatmapData,
  HeatmapDataActions,
  HeatmapGroupData,
} from "./types";
import { actions } from "./actions";

const useHeatmapData = create<HeatmapData>()(
  devtools(
    (set) => ({
      heatmapGroups: new Map(),
      actions: actions({ setState: set }),
    }),
    { name: "HeatmapData" },
  ),
);

export const useHeatmapGroupData = (): HeatmapGroupData => {
  return useHeatmapData(useShallow((state) => state.heatmapGroups));
};

export const useActions = (): HeatmapDataActions => {
  return useHeatmapData((state) => state.actions);
};
