import { StoreApi } from "zustand";
import type { HeatmapData, HeatmapDataActions } from "./types";

export const actions = ({
  setState,
}: Pick<StoreApi<HeatmapData>, "setState">): HeatmapDataActions => ({
  setHeatmapData: (data): void => {
    setState(() => {
      return {
        heatmapGroups: data,
      };
    });
  },
});
