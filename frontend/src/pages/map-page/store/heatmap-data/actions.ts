import { StoreApi } from "zustand";
import type {
  HeatmapData,
  HeatmapDataActions,
  HeatmapFilter,
  HeatmapGroupData,
  HeatmapGroupTimeSegments,
} from "./types";

const initHeatmapGroupTimeSegments = ({
  data,
}: {
  data: HeatmapGroupData;
}): HeatmapGroupTimeSegments => {
  const heatmapGroupTimesegments: HeatmapGroupTimeSegments = new Map();
  for (const [groupId, featureCollection] of data.entries()) {
    heatmapGroupTimesegments.set(groupId, {
      featureCollectionSegments: featureCollection,
    });
  }
  return heatmapGroupTimesegments;
};

export const actions = ({
  setState,
}: Pick<StoreApi<HeatmapData>, "setState">): HeatmapDataActions => ({
  setHeatmapData: ({ data }): void => {
    setState(() => {
      return {
        heatmapGroupTimeSegments: initHeatmapGroupTimeSegments({
          data,
        }),
        featureCollectionsIndex: 0, //todo we need to reset this index better
      };
    });
  },
  setFeatureCollectionsIndex: ({ newIdx }): boolean => {
    let ret = true;
    setState((curState) => {
      const maxLength =
        curState.heatmapGroupTimeSegments.entries().next().value?.[1]
          .featureCollectionSegments.length ?? 0;
      if (newIdx >= maxLength || newIdx < 0) {
        ret = false;
        return {};
      }
      return {
        featureCollectionsIndex: newIdx,
      };
    });
    return ret;
  },
  toggleFullTimePeriodDisplay: (): void => {
    setState((curState) => {
      return {
        fullTimePeriodDisplay: !curState.fullTimePeriodDisplay,
      };
    });
  },
  setHeatmapFilter: ({
    heatmapFilter,
  }: {
    heatmapFilter: HeatmapFilter;
  }): boolean => {
    setState(() => {
      return {
        heatmapFilter,
      };
    });
    return true;
  },
});
