import { StoreApi } from "zustand";
import type {
  HeatmapData,
  HeatmapDataActions,
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
        dateFeatureCollectionsIndex: 0, //todo we need to reset this index better
      };
    });
  },
  setDateFeatureCollectionsIndex: ({ newIdx }): boolean => {
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
        dateFeatureCollectionsIndex: newIdx,
      };
    });
    return ret;
  },
});
