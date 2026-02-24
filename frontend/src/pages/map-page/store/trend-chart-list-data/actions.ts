import { StoreApi } from "zustand";
import type { GroupTrendData, TrendListActions, TrendListData } from "./types";

export const actions = ({
  setState,
}: Pick<StoreApi<TrendListData>, "setState">): TrendListActions => ({
  setGraphData: (data: GroupTrendData): void => {
    setState(() => {
      return {
        groupTrendData: data,
      };
    });
  },
});
