import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import type {
  HeatmapData,
  HeatmapDataActions,
  HeatmapGroupTimeSegments,
} from "./types";
import { actions } from "./actions";
import { GroupId } from "../street-map-data-form";
import { CrashEventFeatureCollection } from "../../../../models/api-models";

const useHeatmapData = create<HeatmapData>()(
  devtools(
    (set) => ({
      heatmapGroupTimeSegments: new Map(),
      featureCollectionsIndex: 0,
      fullTimePeriodDisplay: false,
      actions: actions({ setState: set }),
    }),
    { name: "HeatmapData" },
  ),
);

export const useHeatmapFeatureCollectionsByTimeSegment = (): (readonly [
  GroupId,
  CrashEventFeatureCollection,
])[] => {
  const heatmapGroupTimeSegments = useHeatmapData(
    useShallow((state) => state.heatmapGroupTimeSegments),
  );
  const currentSegmentIdx = useHeatmapData(
    (state) => state.featureCollectionsIndex,
  );

  return Array.from(
    heatmapGroupTimeSegments.entries().map(([groupId, collections]) => {
      return [
        groupId,
        collections.featureCollectionSegments[currentSegmentIdx][1],
      ] as const;
    }),
  );
};

export const useHeatmapFeatureCollections = (): (readonly [
  GroupId,
  CrashEventFeatureCollection,
])[] => {
  const heatmapGroupTimeSegments = useHeatmapData(
    useShallow((state) => state.heatmapGroupTimeSegments),
  );
  const currentSegmentIdx = useHeatmapData(
    (state) => state.featureCollectionsIndex,
  );
  const fullTimePeriodDisplay = useHeatmapData(
    (state) => state.fullTimePeriodDisplay,
  );

  if (fullTimePeriodDisplay) {
    return Array.from(
      heatmapGroupTimeSegments.entries().map(([groupId, collections]) => {
        const mergedFeatureCollection: CrashEventFeatureCollection = {
          type: "FeatureCollection",
          features: [],
        };
        for (const [
          ,
          featureCollection,
        ] of collections.featureCollectionSegments) {
          mergedFeatureCollection.features = [
            ...mergedFeatureCollection.features,
            ...featureCollection.features,
          ];
        }
        return [groupId, mergedFeatureCollection] as const;
      }),
    );
  }
  return Array.from(
    heatmapGroupTimeSegments.entries().map(([groupId, collections]) => {
      return [
        groupId,
        collections.featureCollectionSegments[currentSegmentIdx][1],
      ] as const;
    }),
  );
};

export const useHeatmapTimeSegments = (): HeatmapGroupTimeSegments => {
  return useHeatmapData(useShallow((state) => state.heatmapGroupTimeSegments));
};

export const useFeatureCollectionsIndex = (): number => {
  return useHeatmapData((state) => state.featureCollectionsIndex);
};

export const useFullTimePeriodDisply = (): boolean => {
  return useHeatmapData((state) => state.fullTimePeriodDisplay);
};

export const useHeatmapTimeSegmentDates = (): Date[] => {
  return useHeatmapData(
    useShallow((state) => {
      const heatmapTimeSegment = state.heatmapGroupTimeSegments.entries().next()
        .value?.[1];
      if (heatmapTimeSegment == null) {
        return [];
      }
      return heatmapTimeSegment.featureCollectionSegments.map(([date]) => {
        return date;
      });
    }),
  );
};

export const useActions = (): HeatmapDataActions => {
  return useHeatmapData((state) => state.actions);
};
