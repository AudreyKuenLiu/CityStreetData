import { StoreApi } from "zustand";
import type { HeatmapData, HeatmapDataActions, HeatmapFilter } from "./types";
import { GroupId, StreetGroups } from "../street-map-data-form/types";
import { CrashEventFeatureCollection } from "../../../../models/api-models";
import { CrashMap } from "../../../../models/map-models";
import { feature, featureCollection } from "@turf/turf";
import { buildTimeList, getSelectedCnns } from "../../utils";

const buildGroupFeatureCollections = ({
  crashMap,
  streetGroups,
}: {
  crashMap: CrashMap;
  streetGroups: StreetGroups;
}): (readonly [GroupId, CrashEventFeatureCollection])[] => {
  const groupIdCollection = Array.from(streetGroups.entries()).map(
    ([groupId, streetGroup]) => {
      const streetSegments = Array.from(streetGroup.cnns.entries()).map(
        ([_, streetSegment]) => {
          return streetSegment;
        },
      );
      const uniqueCnns = getSelectedCnns(streetSegments);

      const crashFeatures = [];
      for (const cnn of uniqueCnns) {
        const crashes = crashMap.get(cnn) ?? [];
        for (const crash of crashes) {
          const { point, ...properties } = crash;
          crashFeatures.push(
            feature(point, {
              ...properties,
            }),
          );
        }
      }

      const collection = featureCollection(crashFeatures);

      return [groupId, collection] as const;
    },
  );

  return groupIdCollection;
};

export const actions = ({
  setState,
}: Pick<StoreApi<HeatmapData>, "setState">): HeatmapDataActions => ({
  initializeHeatmap: ({
    data,
    selectedStartEndTime,
    selectedStreetGroups,
    selectedTimeSegment,
  }): void => {
    const timeList = buildTimeList({
      startEndTime: selectedStartEndTime,
      timeSegment: selectedTimeSegment,
    });
    const groupIdFeatureCollections = buildGroupFeatureCollections({
      crashMap: data,
      streetGroups: selectedStreetGroups,
    });

    setState(() => {
      return {
        timeSegmentList: timeList,
        timeSegmentIdx: 0,
        groupIdFeatureCollections,
      };
    });
  },
  setTimeSegmentIdx: ({ newIdx }): boolean => {
    let ret = true;
    setState((curState) => {
      const maxLength = curState.timeSegmentList.length;
      if (newIdx >= maxLength || newIdx < 0) {
        ret = false;
        return {};
      }
      return {
        timeSegmentIdx: newIdx,
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
